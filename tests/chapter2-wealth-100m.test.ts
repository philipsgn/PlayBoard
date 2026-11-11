import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createCoffeeShopGame,
  calculateNetWealth,
  checkMilestoneUnlocks,
  triggerBreakdown,
  resolveBreakdownChallenge,
} from '../src/game/chapter2/engine.ts';

test('Chương 2 Wealth & Metrics: Khởi tạo mặc định 4 chỉ số kinh tế vận hành & quỹ đệm', () => {
  const game = createCoffeeShopGame(90_000_000, 10_000_000);

  assert.equal(game.cash, 100_000_000);
  assert.equal(game.targetWealthGoal, 100_000_000);
  assert.equal(game.emergencyFundBuffer, 10_000_000);

  // 4 chỉ số kinh tế vận hành
  assert.equal(game.metrics.quality, 75);
  assert.equal(game.metrics.speed, 70);
  assert.equal(game.metrics.capacity, 50);
  assert.equal(game.metrics.satisfaction, 70);

  // Ban đầu chưa có sự cố máy pha
  assert.equal(game.breakdownActive, false);
  assert.equal(game.wrenchRepairActive, false);
});

test('Chương 2 Wealth & Metrics: Tính toán Net Wealth (Cash + Equipment)', () => {
  const game = createCoffeeShopGame(50_000_000);
  assert.equal(calculateNetWealth(game), 50_000_000);

  const gameWithEquipment = {
    ...game,
    cash: 45_000_000,
    equipmentValue: 30_000_000,
  };
  assert.equal(calculateNetWealth(gameWithEquipment), 75_000_000);
});

test('Chương 2 Wealth & Metrics: Kiểm tra các mốc Milestone 25M, 50M, 75M, 100M', () => {
  const game = createCoffeeShopGame(10_000_000);
  const check1 = checkMilestoneUnlocks(game);
  assert.deepEqual(check1.newlyReached, []);

  const game30M = { ...game, cash: 30_000_000 };
  const check2 = checkMilestoneUnlocks(game30M);
  assert.deepEqual(check2.newlyReached, [25_000_000]);

  const game110M = {
    ...game,
    cash: 80_000_000,
    equipmentValue: 30_000_000,
    reachedMilestones: [25_000_000, 50_000_000],
  };
  const check3 = checkMilestoneUnlocks(game110M);
  assert.deepEqual(check3.newlyReached, [75_000_000, 100_000_000]);
});

test('Chương 2 Wealth & Metrics: The Breakdown kích hoạt và 3 phương án xử lý', () => {
  const game = createCoffeeShopGame(50_000_000);

  // Kích hoạt sự cố máy pha bốc khói (speed giảm từ 70 xuống 50)
  const brokenGame = triggerBreakdown(game);
  assert.equal(brokenGame.breakdownActive, true);
  assert.equal(brokenGame.metrics.speed, 50);

  // Phương án A: Sửa chữa khẩn cấp 3M (Cờ lê vặn ốc)
  const optionAGame = resolveBreakdownChallenge(brokenGame, 'A');
  assert.equal(optionAGame.breakdownActive, false);
  assert.equal(optionAGame.wrenchRepairActive, true);
  assert.equal(optionAGame.cash, 47_000_000);
  assert.equal(optionAGame.metrics.quality, 70); // 75 - 5
  assert.equal(optionAGame.metrics.speed, 65); // 50 + 15

  // Phương án B: Thay mới máy pha Inox Ý 20M
  const optionBGame = resolveBreakdownChallenge(brokenGame, 'B');
  assert.equal(optionBGame.breakdownActive, false);
  assert.equal(optionBGame.wrenchRepairActive, false);
  assert.equal(optionBGame.cash, 30_000_000);
  assert.equal(optionBGame.equipmentValue, 20_000_000);
  assert.equal(optionBGame.equipment.espressoMachineLevel, 2);
  assert.equal(optionBGame.metrics.quality, 95); // 75 + 20
  assert.equal(optionBGame.metrics.speed, 75); // 50 + 25

  // Phương án C: Tự mò sửa 500k (Mất khách)
  const optionCGame = resolveBreakdownChallenge(brokenGame, 'C');
  assert.equal(optionCGame.breakdownActive, false);
  assert.equal(optionCGame.cash, 49_500_000);
  assert.equal(optionCGame.dailyCupsSold, 15); // 25 - 10
  assert.equal(optionCGame.metrics.speed, 40); // 50 - 10
  assert.equal(optionCGame.metrics.satisfaction, 50); // 70 - 20
});
