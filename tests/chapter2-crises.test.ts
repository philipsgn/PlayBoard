import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createCoffeeShopGame,
  triggerCrisis,
  resolveCrisis,
  startBaristaRush,
  applyBaristaRushResult,
} from '../src/game/chapter2/engine.ts';
import { CHAPTER2_CRISIS_EVENTS, getCrisisForMonth } from '../src/game/chapter2/crises.ts';

test('Chương 2 Crises: Danh mục 4 biến cố khủng hoảng F&B chuẩn thực tế', () => {
  assert.equal(CHAPTER2_CRISIS_EVENTS.length, 4);

  CHAPTER2_CRISIS_EVENTS.forEach((crisis) => {
    assert.ok(crisis.id.startsWith('CRISIS_'));
    assert.ok(crisis.title.length > 5);
    assert.ok(crisis.context.length > 20);
    assert.ok(['high', 'critical', 'opportunity'].includes(crisis.urgencyLevel));
    assert.equal(crisis.options.length, 3);

    crisis.options.forEach((opt) => {
      assert.ok(['A', 'B', 'C'].includes(opt.id));
      assert.ok(opt.label.length > 5);
      assert.ok(opt.takeawayLesson.length > 10);
    });
  });
});

test('Chương 2 Crises: getCrisisForMonth lấy biến cố theo tháng chưa giải quyết', () => {
  const c1 = getCrisisForMonth(1, []);
  assert.ok(c1);
  assert.equal(c1.id, 'CRISIS_TIKTOK_REVIEWER');

  // Đã giải quyết c1 thì không lấy lại
  const c1Resolved = getCrisisForMonth(1, ['CRISIS_TIKTOK_REVIEWER']);
  assert.equal(c1Resolved, null);

  // Tháng 2 có biến cố
  const c2 = getCrisisForMonth(2, []);
  assert.ok(c2);
  assert.equal(c2.id, 'CRISIS_POWER_OUTAGE');
});

test('Chương 2 Crises: Trigger và Resolve biến cố tác động tài chính chính xác', () => {
  let game = createCoffeeShopGame(90_000_000, 0);

  // Kích hoạt biến cố Tháng 1
  game = triggerCrisis(game);
  assert.equal(game.phase, 'crisis');
  assert.ok(game.activeCrisis);
  assert.equal(game.activeCrisis.id, 'CRISIS_TIKTOK_REVIEWER');

  // Giải quyết bằng lựa chọn A (Đăng clip cầu thị: -2M, +15 satisfaction)
  const initialCash = game.cash;
  const initialSat = game.customerSatisfaction;

  game = resolveCrisis(game, 'A');
  assert.equal(game.phase, 'decisions');
  assert.equal(game.activeCrisis, null);
  assert.equal(game.cash, initialCash - 2_000_000);
  assert.equal(game.customerSatisfaction, initialSat + 15);
  assert.ok(game.resolvedCrisisIds.includes('CRISIS_TIKTOK_REVIEWER'));
});

test('Chương 2 Barista Rush: Mini-game giờ cao điểm thưởng Tip và Buff sản lượng', () => {
  let game = createCoffeeShopGame(90_000_000, 0);

  // Giả lập trạng thái kết toán P&L cuối tháng
  game = { ...game, phase: 'monthly_settlement', baristaRushCompleted: false };

  // Bắt đầu Barista Rush
  game = startBaristaRush(game);
  assert.equal(game.phase, 'barista_rush');

  const beforeCash = game.cash;
  const beforeCups = game.dailyCupsSold;

  // Đạt 3/3 Perfect -> +1.5M VND và +15 ly/ngày
  game = applyBaristaRushResult(game, 3);
  assert.equal(game.phase, 'monthly_settlement');
  assert.equal(game.baristaRushCompleted, true);
  assert.equal(game.lastRushTip, 1_500_000);
  assert.equal(game.cash, beforeCash + 1_500_000);
  assert.equal(game.dailyCupsSold, beforeCups + 15);
});
