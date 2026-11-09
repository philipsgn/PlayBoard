import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createCoffeeShopGame,
  getCurrentCard,
  applyDecision,
  executeMonthlySettlement,
  evaluateChapter2Outcome,
} from '../src/game/chapter2/engine.ts';
import { CHAPTER2_DECISION_CARDS } from '../src/game/chapter2/cards.ts';
import {
  calculateTotalFixedCosts,
  calculateBreakEvenCupsDaily,
  generateMonthlyPnL,
  calculateCashRunway,
} from '../src/game/chapter2/pnl.ts';

test('Chương 2 Cards: Danh mục đầy đủ 12 thẻ quyết định chuẩn GDD', () => {
  assert.equal(CHAPTER2_DECISION_CARDS.length, 12);
  
  // 4 thẻ mỗi tháng
  const m1 = CHAPTER2_DECISION_CARDS.filter((c) => c.month === 1);
  const m2 = CHAPTER2_DECISION_CARDS.filter((c) => c.month === 2);
  const m3 = CHAPTER2_DECISION_CARDS.filter((c) => c.month === 3);
  assert.equal(m1.length, 4);
  assert.equal(m2.length, 4);
  assert.equal(m3.length, 4);

  // Mỗi thẻ có đúng 3 lựa chọn A, B, C và đầy đủ bài học tài chính
  CHAPTER2_DECISION_CARDS.forEach((card) => {
    assert.equal(card.options.length, 3);
    card.options.forEach((opt) => {
      assert.ok(['A', 'B', 'C'].includes(opt.id));
      assert.ok(opt.label.length > 5);
      assert.ok(opt.takeawayLesson.length > 10);
    });
  });
});

test('Chương 2 PnL: Công thức toán kinh tế thực tế 2026', () => {
  const fixed = {
    rent: 10_000_000,
    labor: 5_000_000,
    utilities: 2_000_000,
    equipmentDepreciation: 1_000_000,
    equipmentRental: 0,
  };
  const totalFixed = calculateTotalFixedCosts(fixed);
  assert.equal(totalFixed, 18_000_000);

  // Số ly hòa vốn: Giá bán 35k, Biến phí 30% (10.5k) -> Lãi gộp mỗi ly = 24.5k
  // Số ly/tháng = 18.000.000 / 24.500 = ~735 ly -> ~25 ly/ngày
  const breakEvenDaily = calculateBreakEvenCupsDaily(totalFixed, 35_000, 0.30);
  assert.equal(breakEvenDaily, 25);

  // Runway tiền mặt: Nếu lỗ 10M/tháng và có 30M tiền mặt -> Runway = 3.0 tháng
  assert.equal(calculateCashRunway(30_000_000, -10_000_000), 3.0);
  assert.equal(calculateCashRunway(30_000_000, 5_000_000), Infinity);
});

test('Chương 2 Engine: Khởi tạo game với vốn chuẩn và quỹ dự phòng bonus', () => {
  const game = createCoffeeShopGame(90_000_000, 15_000_000);
  assert.equal(game.month, 1);
  assert.equal(game.cash, 105_000_000);
  assert.equal(game.capitalInvested, 90_000_000);
  assert.equal(game.bonusRunwayCash, 15_000_000);
  assert.equal(game.currentCardIndex, 0);
  assert.equal(game.phase, 'decisions');

  const card1 = getCurrentCard(game);
  assert.ok(card1);
  assert.equal(card1.id, 'CH2_CARD_01');
});

test('Chương 2 Engine: Áp dụng quyết định theo trình tự và kết toán P&L', () => {
  let game = createCoffeeShopGame(90_000_000, 0);

  // Quyết định 1: Chọn mặt bằng hẻm (B)
  game = applyDecision(game, 'B');
  assert.equal(game.currentCardIndex, 1);
  assert.equal(game.fixedCosts.rent, 10_000_000);
  assert.equal(game.cash, 70_000_000); // 90M - 20M cọc

  // Quyết định 2: Mua máy pha lướt (B)
  game = applyDecision(game, 'B');
  assert.equal(game.currentCardIndex, 2);
  assert.equal(game.cash, 52_000_000); // 70M - 18M

  // Quyết định 3: Tuyển part-time sinh viên (B)
  game = applyDecision(game, 'B');
  assert.equal(game.currentCardIndex, 3);
  assert.equal(game.fixedCosts.labor, 5_000_000);

  // Quyết định 4: Hạt Robusta thương mại (B)
  game = applyDecision(game, 'B');
  assert.equal(game.currentCardIndex, 4);
  assert.equal(game.phase, 'monthly_settlement'); // Đủ 4 thẻ -> Chờ kết toán

  // Thực hiện kết toán Tháng 1
  game = executeMonthlySettlement(game);
  assert.equal(game.monthlyPnL.length, 1);
  assert.equal(game.month, 2); // Đã chuyển sang Tháng 2
  assert.equal(game.currentCardIndex, 0);
  assert.equal(game.phase, 'decisions');
});

test('Chương 2 Engine: Mô phỏng toàn ván 3 tháng ĐẠT CHIẾN THẮNG HÒA VỐN', () => {
  let game = createCoffeeShopGame(90_000_000, 10_000_000);

  // Tháng 1: Setup tối ưu chi phí
  game = applyDecision(game, 'B'); // Mặt bằng hẻm
  game = applyDecision(game, 'B'); // Máy pha lướt
  game = applyDecision(game, 'B'); // Nhân sự part-time
  game = applyDecision(game, 'B'); // Hạt thương mại
  game = executeMonthlySettlement(game);
  assert.equal(game.month, 2);

  // Tháng 2: Marketing & Quản trị tồn kho
  game = applyDecision(game, 'A'); // Mua 1 tặng 1 (+45 ly)
  game = applyDecision(game, 'A'); // Xử lý phàn nàn chu đáo (+15 ly)
  game = applyDecision(game, 'A'); // Cài POS định lượng (-3% COGS)
  game = applyDecision(game, 'A'); // Tiết kiệm điện (-1M utilities)
  game = executeMonthlySettlement(game);
  assert.equal(game.month, 3);

  // Tháng 3: Vượt bão biến cố & Tái đầu tư
  game = applyDecision(game, 'A'); // Giữ giá đẩy Signature (+15 ly)
  game = applyDecision(game, 'A'); // Thợ sửa máy 24/7 khẩn cấp (+5 ly)
  game = applyDecision(game, 'A'); // Tăng giá bù chi phí lạm phát
  game = applyDecision(game, 'A'); // Trích quỹ dự phòng mở chuỗi
  game = executeMonthlySettlement(game);

  // Kiểm tra kết quả chung cuộc
  assert.equal(game.phase, 'chapter_result');
  assert.ok(game.outcome);
  assert.equal(game.outcome.victory, true);
  assert.ok(game.outcome.finalNetProfit > 0);
  assert.ok(game.cash > 0);
});

test('Chương 2 Engine: Phá sản sớm nếu chọn các phương án định phí quá đà làm cạn kiệt Runway', () => {
  // Bắt đầu với vốn eo hẹp 20M
  let game = createCoffeeShopGame(20_000_000, 0);

  // Thuê mặt tiền khủng (Cọc 54M) -> Tiền mặt âm ngay lập tức
  game = applyDecision(game, 'A');
  assert.ok(game.cash < 0);

  game = applyDecision(game, 'A');
  game = applyDecision(game, 'A');
  game = applyDecision(game, 'A');

  // Kết toán tháng 1
  game = executeMonthlySettlement(game);
  assert.equal(game.phase, 'chapter_result');
  assert.ok(game.outcome);
  assert.equal(game.outcome.victory, false);
});
