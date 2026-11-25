import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createChapterBoardGame } from '../src/game/new-game.ts';
import { decide, transact } from '../src/game/engine.ts';
import { beginSettlement } from '../src/game/settlement.ts';
import { goalProgress, victory } from '../src/game/selectors.ts';
import { livingCostForGame } from '../src/game/living-expenses.ts';
import {
  borrowLeverage,
  evaluateAndExecuteMarginCall,
  leverageRatio,
  safeBufferForGame,
} from '../src/game/chapter-mechanics.ts';
import { boardFor } from '../src/data/board.ts';
import { eventsForGame } from '../src/data/events.ts';

test('Multi-Chapter Board: Khởi tạo chuẩn xác 3 Chương Bàn Cờ (50M->90M, 90M+->180M, 180M+->360M)', () => {
  const ch1 = createChapterBoardGame(1, 'CH1-SEED');
  assert.equal(ch1.portfolio.cash, 50_000_000);
  assert.equal(goalProgress(ch1).target, 90_000_000);
  assert.equal(ch1.totalLaps, 4);
  assert.equal(safeBufferForGame(ch1), 10_000_000);

  // Chương 2 với 25M thặng dư từ Ch1 -> bị chặn trần ở mức +15M (tổng vốn đầu vào 105M)
  const ch2 = createChapterBoardGame(2, 'CH2-SEED', 25_000_000);
  assert.equal(ch2.chapterId, 2);
  assert.equal(ch2.portfolio.cash, 105_000_000);
  assert.equal(goalProgress(ch2).target, 180_000_000);
  assert.equal(ch2.totalLaps, 4);
  assert.equal(ch2.recurringIncome, 20_000_000);
  assert.equal(ch2.borrowingLimit, 60_000_000);
  assert.equal(safeBufferForGame(ch2), 15_000_000);

  // Chương 3 với 50M thặng dư từ Ch2 -> bị chặn trần ở mức +30M (tổng vốn đầu vào 210M, 5 vòng)
  const ch3 = createChapterBoardGame(3, 'CH3-SEED', 50_000_000);
  assert.equal(ch3.chapterId, 3);
  assert.equal(ch3.portfolio.cash, 210_000_000);
  assert.equal(goalProgress(ch3).target, 360_000_000);
  assert.equal(ch3.totalLaps, 5);
  assert.equal(ch3.recurringIncome, 28_000_000);
  assert.equal(ch3.borrowingLimit, 120_000_000);
  assert.equal(safeBufferForGame(ch3), 25_000_000);
});

test('Multi-Chapter Board: Lạm phát sinh hoạt phí lũy tiến ở Chương 2 và Chương 3', () => {
  const ch1 = createChapterBoardGame(1, 'INFLATION-1');
  assert.equal(livingCostForGame({ ...ch1, lap: 1 }), 5_000_000);
  assert.equal(livingCostForGame({ ...ch1, lap: 4 }), 5_000_000);

  const ch2 = createChapterBoardGame(2, 'INFLATION-2');
  assert.equal(livingCostForGame({ ...ch2, lap: 1 }), 8_000_000);
  assert.equal(livingCostForGame({ ...ch2, lap: 2 }), 9_000_000);
  assert.equal(livingCostForGame({ ...ch2, lap: 3 }), 10_000_000);
  assert.equal(livingCostForGame({ ...ch2, lap: 4 }), 11_000_000);

  const ch3 = createChapterBoardGame(3, 'INFLATION-3');
  assert.equal(livingCostForGame({ ...ch3, lap: 1 }), 12_000_000);
  assert.equal(livingCostForGame({ ...ch3, lap: 3 }), 15_000_000);
  assert.equal(livingCostForGame({ ...ch3, lap: 5 }), 18_000_000);
});

test('Multi-Chapter Board: Thẻ Tình Huống Hệ Quả Trễ (Bảo hiểm Phòng vệ & Cắt giảm bảo trì)', () => {
  let ch2 = createChapterBoardGame(2, 'DELAYED-SEED');
  const personalIdx = boardFor(ch2).findIndex(t => t.type === 'personal');

  // 1. Mua Bảo hiểm Phòng vệ khi gặp biến cố medical
  ch2 = { ...ch2, phase: 'event', position: personalIdx, eventId: 'medical' };
  const medEvent = eventsForGame(ch2).find(e => e.id === 'medical')!;
  const buyInsOpt = medEvent.options.find(o => o.id === 'buy-insurance');
  assert.ok(buyInsOpt, 'Phải có lựa chọn mua Bảo hiểm Phòng vệ ở Chương 2');

  ch2 = decide(ch2, 'buy-insurance');
  assert.equal(ch2.delayedEffects?.insuredLapsRemaining, 2);

  // Lượt sau gặp biến cố family -> được dùng bảo hiểm miễn phí 0 VND
  ch2 = { ...ch2, phase: 'event', position: personalIdx, eventId: 'family' };
  const cashBeforeClaim = ch2.portfolio.cash;
  ch2 = decide(ch2, 'claim-insurance');
  assert.equal(ch2.portfolio.cash, cashBeforeClaim);
  assert.equal(ch2.delayedEffects?.insuredLapsRemaining, 1);

  // 2. Mở tiệm kinh doanh rồi chọn Cắt giảm chi phí bảo trì (+3M ngay nhưng giảm 35% doanh thu kỳ START)
  const bizIdx = boardFor(ch2).findIndex(t => t.type === 'business');
  ch2 = transact({ ...ch2, phase: 'event', position: bizIdx, eventId: 'business' }, {
    kind: 'buy',
    asset: 'business',
    amount: 20_000_000,
  });

  const baselineSettled = beginSettlement(ch2);
  const baselineBizLine = baselineSettled.summaries[0].lines.find(l => l.label === 'Dòng tiền kinh doanh')!;

  ch2 = { ...ch2, phase: 'event', position: personalIdx, eventId: 'repair' };
  const cashBeforeDefer = ch2.portfolio.cash;
  ch2 = decide(ch2, 'defer-maintenance');
  assert.equal(ch2.portfolio.cash, cashBeforeDefer + 3_000_000);
  assert.equal(ch2.delayedEffects?.businessRevenuePenaltyNextLap, true);

  const penalizedSettled = beginSettlement(ch2);
  const penalizedBizLine = penalizedSettled.summaries[0].lines.find(l => l.label === 'Dòng tiền kinh doanh')!;
  assert.equal(penalizedBizLine.amount, Math.round(baselineBizLine.amount * 0.65));
  assert.equal(penalizedSettled.delayedEffects?.businessRevenuePenaltyNextLap, false);
});

test('Multi-Chapter Board: Vay đòn bẩy và Cưỡng chế Call Margin ở Chương 3 khi Nợ/Tài sản > 60%', () => {
  let ch3 = createChapterBoardGame(3, 'MARGIN-SEED');
  // Giải ngân đòn bẩy 90M VND (Tổng tiền mặt = 180M + 90M = 270M, Nợ = 90M -> Tỷ lệ = 33.3%)
  ch3 = borrowLeverage(ch3, 90_000_000);
  assert.equal(ch3.portfolio.debt, 90_000_000);
  assert.equal(ch3.portfolio.cash, 270_000_000);
  assert.ok(leverageRatio(ch3) < 0.60);

  // Mua 200M cổ phiếu (còn 70M tiền mặt), sau đó giả lập thị trường sập làm giá trị cổ phiếu còn 60M
  const stockIdx = boardFor(ch3).findIndex(t => t.type === 'stocks');
  ch3 = transact({ ...ch3, phase: 'event', position: stockIdx, eventId: 'stocks' }, {
    kind: 'buy',
    asset: 'stocks',
    amount: 200_000_000,
    symbolId: ch3.market.stocks[0].id,
    completeEncounter: true,
  });

  // Giả lập khách hàng còn 10M tiền mặt và 110M cổ phiếu (Tài sản đảm bảo ~118.9M, Nợ = 90M -> Ratio = 75.7% > 60%)
  ch3 = {
    ...ch3,
    portfolio: {
      ...ch3.portfolio,
      cash: 10_000_000,
      stocks: 110_000_000,
    },
  };
  ch3.stockHoldings[ch3.market.stocks[0].id].units = 110_000_000 / ch3.market.stocks[0].currentPrice;

  assert.ok(leverageRatio(ch3) > 0.60, 'Tỷ lệ đòn bẩy phải vượt ngưỡng 60%');

  const afterMarginCall = evaluateAndExecuteMarginCall(ch3);
  assert.equal(afterMarginCall.marginCallCount, 1);
  assert.ok(afterMarginCall.portfolio.debt < 90_000_000, 'Nợ phải được giảm sau Call Margin');
  assert.ok(afterMarginCall.portfolio.stocks < 110_000_000, 'Cổ phiếu phải bị thanh lý cưỡng bức một phần');
  assert.equal(afterMarginCall.log.at(-1)?.decisionId, 'forced-margin-call');
});

test('Multi-Chapter Board: Điều kiện thắng Chương 3 yêu cầu đủ 5 vòng quyết toán và >= 360M VND', () => {
  const ch3 = createChapterBoardGame(3, 'VICTORY-CH3');
  const mockSummaries = [1, 2, 3, 4, 5].map(lap => ({
    lap,
    before: 200_000_000,
    after: 365_000_000,
    lines: [],
    rates: { stocks: 0, bonds: 0, gold: 0, business: 0 },
    incomeTotal: 28_000_000,
    debtPrincipalPaid: 0,
    fundingNotes: [],
  }));

  const finishedWin = {
    ...ch3,
    phase: 'finished' as const,
    termination: 'completed' as const,
    lap: 5,
    summaries: mockSummaries,
    portfolio: { ...ch3.portfolio, cash: 360_000_000 },
  };
  assert.equal(victory(finishedWin).won, true);

  const finishedShortCash = {
    ...finishedWin,
    portfolio: { ...ch3.portfolio, cash: 359_000_000 },
  };
  assert.equal(victory(finishedShortCash).won, false);

  const finishedOnly4Laps = {
    ...finishedWin,
    summaries: mockSummaries.slice(0, 4),
  };
  assert.equal(victory(finishedOnly4Laps).won, false);
});
