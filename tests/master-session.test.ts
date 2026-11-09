import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultProfile,
  calculateChapter1Carryover,
  recordChapter1Victory,
  canAccessChapter,
  setActiveChapter,
  BASE_STARTING_CAPITAL_CH2,
  WINNING_THRESHOLD_CH1,
} from '../src/game/master-session.ts';

test('MasterSession: tạo profile mặc định chuẩn xác', () => {
  const profile = createDefaultProfile();
  assert.equal(profile.activeChapter, 1);
  assert.equal(profile.unlockedChapters.chapter1, true);
  assert.equal(profile.unlockedChapters.chapter2, false);
  assert.equal(profile.unlockedChapters.chapter3, false);
  assert.equal(profile.carryoverFromChapter1, undefined);
});

test('MasterSession: tính toán vốn chuyển giao động (Dynamic Carryover)', () => {
  // Trường hợp 1: Đúng 90M VND
  const carryoverExact = calculateChapter1Carryover(90_000_000, 'A');
  assert.equal(carryoverExact.startingCapitalForCh2, BASE_STARTING_CAPITAL_CH2);
  assert.equal(carryoverExact.bonusRunwayCash, 0);
  assert.equal(carryoverExact.totalInitialCashForCh2, 90_000_000);

  // Trường hợp 2: Thặng dư 115M VND (dư 25M làm Runway bonus)
  const carryoverBonus = calculateChapter1Carryover(115_000_000, 'S');
  assert.equal(carryoverBonus.startingCapitalForCh2, BASE_STARTING_CAPITAL_CH2);
  assert.equal(carryoverBonus.bonusRunwayCash, 25_000_000);
  assert.equal(carryoverBonus.totalInitialCashForCh2, 115_000_000);
  assert.equal(carryoverBonus.financialHealthGrade, 'S');
});

test('MasterSession: ghi nhận chiến thắng Chương 1 và mở khóa Chương 2', () => {
  const initial = createDefaultProfile();

  // Thử ghi nhận khi chưa đủ 90M (85M) -> Không mở khóa
  const failedAttempt = recordChapter1Victory(initial, 85_000_000, 'B');
  assert.equal(failedAttempt.unlockedChapters.chapter2, false);
  assert.equal(failedAttempt.carryoverFromChapter1, undefined);

  // Ghi nhận khi đạt 98M -> Mở khóa thành công
  const victoryAttempt = recordChapter1Victory(initial, 98_000_000, 'A');
  assert.equal(victoryAttempt.unlockedChapters.chapter2, true);
  assert.ok(victoryAttempt.carryoverFromChapter1);
  assert.equal(victoryAttempt.carryoverFromChapter1.bonusRunwayCash, 8_000_000);
  assert.equal(victoryAttempt.carryoverFromChapter1.totalInitialCashForCh2, 98_000_000);
});

test('MasterSession: phân quyền truy cập và chuyển đổi Chương chơi', () => {
  const profile = createDefaultProfile();

  assert.equal(canAccessChapter(profile, 1), true);
  assert.equal(canAccessChapter(profile, 2), false);

  // Cố chuyển sang Chương 2 khi chưa mở khóa -> Giữ nguyên Chương 1
  const invalidSwitch = setActiveChapter(profile, 2);
  assert.equal(invalidSwitch.activeChapter, 1);

  // Sau khi thắng Chương 1
  const unlocked = recordChapter1Victory(profile, 92_000_000, 'A');
  assert.equal(canAccessChapter(unlocked, 2), true);

  const switched = setActiveChapter(unlocked, 2);
  assert.equal(switched.activeChapter, 2);
});
