import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractVisualMetaphors,
  GOAL_TARGET_AMOUNT,
  MAX_SAFE_DEBT,
  DEBT_CAP,
} from '../mobile_app/src/features/stage3d/bindings/stateBindings.ts';
import type { GameState } from '../src/game/types.ts';

test('Stage3D Bindings: Giá trị mặc định khi GameState rỗng hoặc undefined', () => {
  const result = extractVisualMetaphors(null);

  assert.equal(result.lap, 1);
  assert.equal(result.timeOfDay, 'morning');
  assert.equal(result.isDebtCritical, false);
  assert.equal(result.debtChainLinks, 0);
  assert.ok(result.coinHeight > 0);
  assert.ok(result.goalProgressRatio > 0);
  assert.equal(result.goalAchieved, false);
});

test('Stage3D Bindings: Chuyển đổi tiền mặt sang chiều cao chồng xu', () => {
  // Mock GameState với tiền mặt 10M
  const mockGame10M = {
    portfolio: { cash: 10_000_000, savings: 0, stocks: 0, bonds: 0, gold: 0, business: 0, debt: 0 },
    lap: 1,
  } as unknown as GameState;

  const res10M = extractVisualMetaphors(mockGame10M);
  assert.equal(res10M.cash, 10_000_000);
  assert.ok(res10M.coinHeight >= 0.1 && res10M.coinHeight <= 0.3);

  // Mock GameState với tiền mặt 60M
  const mockGame60M = {
    portfolio: { cash: 60_000_000, savings: 0, stocks: 0, bonds: 0, gold: 0, business: 0, debt: 0 },
    lap: 1,
  } as unknown as GameState;

  const res60M = extractVisualMetaphors(mockGame60M);
  assert.equal(res60M.coinHeight, 1.0);
  assert.equal(res60M.coinCount, 10);
});

test('Stage3D Bindings: Dây xích nợ và cảnh báo nợ nguy cấp khi >= 25M', () => {
  // Nợ an toàn 10M
  const mockSafeDebt = {
    portfolio: { cash: 20_000_000, savings: 0, stocks: 0, bonds: 0, gold: 0, business: 0, debt: 10_000_000 },
    lap: 2,
  } as unknown as GameState;

  const resSafe = extractVisualMetaphors(mockSafeDebt);
  assert.equal(resSafe.debt, 10_000_000);
  assert.equal(resSafe.isDebtCritical, false);
  assert.ok(resSafe.debtChainLinks > 0 && resSafe.debtChainLinks <= 4);

  // Nợ nguy cấp 26M (vượt mức an toàn 25M, tiến sát trần 30M)
  const mockCriticalDebt = {
    portfolio: { cash: 5_000_000, savings: 0, stocks: 0, bonds: 0, gold: 0, business: 0, debt: 26_000_000 },
    lap: 3,
  } as unknown as GameState;

  const resCritical = extractVisualMetaphors(mockCriticalDebt);
  assert.equal(resCritical.debt, 26_000_000);
  assert.equal(resCritical.isDebtCritical, true);
  assert.ok(resCritical.debtChainLinks >= 8);
});

test('Stage3D Bindings: Thời điểm trong ngày (Time of day) theo 4 Vòng chơi & Mục tiêu 90M', () => {
  const laps = [1, 2, 3, 4];
  const expectedTimes = ['morning', 'noon', 'afternoon', 'night'];

  laps.forEach((lap, idx) => {
    const mockLap = {
      portfolio: { cash: 30_000_000, savings: 0, stocks: 0, bonds: 0, gold: 0, business: 0, debt: 0 },
      lap,
    } as unknown as GameState;

    const res = extractVisualMetaphors(mockLap);
    assert.equal(res.lap, lap);
    assert.equal(res.timeOfDay, expectedTimes[idx]);
  });

  // Kiểm tra cán đích 90M
  const mockVictory = {
    portfolio: { cash: 95_000_000, savings: 0, stocks: 0, bonds: 0, gold: 0, business: 0, debt: 0 },
    lap: 4,
  } as unknown as GameState;

  const resVictory = extractVisualMetaphors(mockVictory);
  assert.equal(resVictory.goalProgressRatio, 1.0);
  assert.equal(resVictory.goalAchieved, true);
});
