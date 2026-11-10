import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createCoffeeShopGame,
  restockInventory,
  upgradeEquipment,
  startWorkShift,
  completeDrinkOrder,
  RESTOCK_PACKAGES,
  EQUIPMENT_UPGRADES,
  executeMonthlySettlement,
} from '../src/game/chapter2/engine.ts';

test('Chương 2 Tycoon: Nhập kho nguyên liệu trừ tiền chuẩn và tăng tồn kho', () => {
  const game = createCoffeeShopGame(90_000_000, 10_000_000);
  assert.equal(game.cash, 100_000_000);
  assert.equal(game.inventory.beansRobustaKg, 15);
  assert.equal(game.monthRestockSpent, 0);

  // Nhập gói hạt Robusta 10kg (1.200.000 VND)
  const afterRobusta = restockInventory(game, 'restock_robusta_10kg');
  assert.equal(afterRobusta.cash, 100_000_000 - 1_200_000);
  assert.equal(afterRobusta.inventory.beansRobustaKg, 25);
  assert.equal(afterRobusta.monthRestockSpent, 1_200_000);

  // Thử nhập khi không đủ tiền
  const brokeGame = { ...game, cash: 100_000 };
  const failedRestock = restockInventory(brokeGame, 'restock_robusta_10kg');
  assert.equal(failedRestock.cash, 100_000); // Không bị trừ âm
  assert.equal(failedRestock.inventory.beansRobustaKg, 15);
});

test('Chương 2 Tycoon: Nâng cấp thiết bị quầy bar 3D cộng giá trị tài sản & khấu hao', () => {
  const game = createCoffeeShopGame(90_000_000, 0);
  assert.equal(game.equipment.espressoMachineLevel, 1);
  assert.equal(game.equipmentValue, 0);

  // Nâng cấp Máy pha Dual-Group Inox (20M VND)
  const afterUpgrade = upgradeEquipment(game, 'espressoMachine_2');
  assert.equal(afterUpgrade.equipment.espressoMachineLevel, 2);
  assert.equal(afterUpgrade.cash, 70_000_000);
  assert.equal(afterUpgrade.equipmentValue, 20_000_000);
  assert.equal(afterUpgrade.fixedCosts.equipmentDepreciation, 800_000);
  assert.equal(afterUpgrade.dailyCupsSold, 25 + 12);
  assert.equal(afterUpgrade.monthUpgradeSpent, 20_000_000);

  // Không cho phép mua lặp lại máy pha level 2
  const dupUpgrade = upgradeEquipment(afterUpgrade, 'espressoMachine_2');
  assert.equal(dupUpgrade.cash, 70_000_000);
  assert.equal(dupUpgrade.equipmentValue, 20_000_000);
});

test('Chương 2 Tycoon: Ca trực 3D phục vụ khách, tiêu hao kho và thu tiền + tip', () => {
  const game = createCoffeeShopGame(90_000_000, 0);
  const shiftGame = startWorkShift(game);

  assert.equal(shiftGame.phase, 'work_shift_3d');
  assert.ok((shiftGame.workShiftOrders || []).length >= 3);

  const firstOrder = shiftGame.workShiftOrders![0];
  const initialCash = shiftGame.cash;
  const initialRobusta = shiftGame.inventory.beansRobustaKg;
  const initialArabica = shiftGame.inventory.beansArabicaKg;

  // Hoàn tất đơn hàng đầu tiên với tiền tip 15.000 VND
  const tipAmount = 15_000;
  const afterFirstOrder = completeDrinkOrder(shiftGame, firstOrder.id, true, tipAmount);

  assert.equal(afterFirstOrder.cash, initialCash + firstOrder.price + tipAmount);
  assert.equal(afterFirstOrder.workShiftEarnings, firstOrder.price);
  assert.equal(afterFirstOrder.workShiftTips, tipAmount);

  // Kiểm tra trừ kho nguyên liệu tương ứng
  if (firstOrder.recipe.beanType === 'robusta') {
    assert.ok(afterFirstOrder.inventory.beansRobustaKg < initialRobusta);
  } else {
    assert.ok(afterFirstOrder.inventory.beansArabicaKg < initialArabica);
  }

  // Hoàn tất tất cả đơn hàng còn lại
  let runningGame = afterFirstOrder;
  while ((runningGame.workShiftOrders || []).length > 0) {
    const nextOrder = runningGame.workShiftOrders![0];
    runningGame = completeDrinkOrder(runningGame, nextOrder.id, true, 10_000);
  }

  // Kết thúc ca trực chuyển sang monthly_settlement
  assert.equal(runningGame.phase, 'monthly_settlement');
  assert.equal(runningGame.workShiftCompleted, true);
});

test('Chương 2 Tycoon: Kết toán tháng bảo toàn thiết bị/kho và reset bộ đếm chi tiêu', () => {
  let game = createCoffeeShopGame(90_000_000, 0);
  game = restockInventory(game, 'restock_condensed_milk_24');
  game = upgradeEquipment(game, 'pastryCabinet');
  game.phase = 'monthly_settlement';

  const nextMonthGame = executeMonthlySettlement(game);
  assert.equal(nextMonthGame.month, 2);
  assert.equal(nextMonthGame.equipment.pastryCabinet, true);
  assert.equal(nextMonthGame.inventory.condensedMilkCans, 15 + 24);
  assert.equal(nextMonthGame.monthRestockSpent, 0);
  assert.equal(nextMonthGame.monthUpgradeSpent, 0);
  assert.equal(nextMonthGame.phase, 'decisions');
});
