import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultProfile,
  calculateChapter1Carryover,
  calculateChapter2Carryover,
  recordChapter1Victory,
  recordChapter2Victory,
  recordBoardChapterVictory,
  getCarryoverBonusForChapter,
  canAccessChapter,
  setActiveChapter,
  BASE_STARTING_CAPITAL_CH2,
  BASE_STARTING_CAPITAL_CH3,
  MAX_CARRYOVER_CH1_TO_CH2,
  MAX_CARRYOVER_CH2_TO_CH3,
} from '../src/game/master-session.ts';

test('MasterSession: tạo profile mặc định chuẩn xác', () => {
  const profile = createDefaultProfile();
  assert.equal(profile.activeChapter, 1);
  assert.equal(profile.unlockedChapters.chapter1, true);
  assert.equal(profile.unlockedChapters.chapter2, false);
  assert.equal(profile.unlockedChapters.chapter3, false);
  assert.equal(profile.carryoverFromChapter1, undefined);
});

test('MasterSession: tính toán vốn chuyển giao Capped Carryover giữa Chương 1 -> 2 -> 3', () => {
  // Trường hợp 1: Đúng 90M VND ở Chương 1
  const carryoverExact = calculateChapter1Carryover(90_000_000, 'A');
  assert.equal(carryoverExact.startingCapitalForCh2, BASE_STARTING_CAPITAL_CH2);
  assert.equal(carryoverExact.bonusRunwayCash, 0);
  assert.equal(carryoverExact.cappedBonusForCh2, 0);
  assert.equal(carryoverExact.playableStartingCashCh2, 90_000_000);

  // Trường hợp 2: Thặng dư 115M VND ở Chương 1 (vượt 25M -> trần Capped Carryover giữ ở +15M = 105M)
  const carryoverBonus = calculateChapter1Carryover(115_000_000, 'S');
  assert.equal(carryoverBonus.startingCapitalForCh2, BASE_STARTING_CAPITAL_CH2);
  assert.equal(carryoverBonus.bonusRunwayCash, 25_000_000);
  assert.equal(carryoverBonus.cappedBonusForCh2, MAX_CARRYOVER_CH1_TO_CH2);
  assert.equal(carryoverBonus.playableStartingCashCh2, 105_000_000);
  assert.equal(carryoverBonus.totalInitialCashForCh2, 115_000_000);
  assert.equal(carryoverBonus.financialHealthGrade, 'S');

  // Trường hợp 3: Thặng dư 230M VND ở Chương 2 (vượt 50M -> trần Capped Carryover giữ ở +30M = 210M cho Ch3)
  const ch2Carryover = calculateChapter2Carryover(230_000_000, 'S');
  assert.equal(ch2Carryover.startingCapitalForCh3, BASE_STARTING_CAPITAL_CH3);
  assert.equal(ch2Carryover.rawSurplusCash, 50_000_000);
  assert.equal(ch2Carryover.cappedBonusForCh3, MAX_CARRYOVER_CH2_TO_CH3);
  assert.equal(ch2Carryover.playableStartingCashCh3, 210_000_000);
});

test('MasterSession: ghi nhận chiến thắng tuần tự Chương 1 -> Chương 2 -> Chương 3', () => {
  const initial = createDefaultProfile();

  // Thử ghi nhận khi chưa đủ 90M (85M) -> Không mở khóa Chương 2
  const failedAttempt = recordChapter1Victory(initial, 85_000_000, 'B');
  assert.equal(failedAttempt.unlockedChapters.chapter2, false);
  assert.equal(failedAttempt.carryoverFromChapter1, undefined);

  // Ghi nhận khi đạt 98M ở Chương 1 -> Mở khóa Chương 2 với +8M carryover
  const ch1Won = recordChapter1Victory(initial, 98_000_000, 'A');
  assert.equal(ch1Won.unlockedChapters.chapter2, true);
  assert.equal(getCarryoverBonusForChapter(ch1Won, 2), 8_000_000);

  // Ghi nhận khi đạt 200M ở Chương 2 -> Mở khóa Chương 3 với +20M carryover
  const ch2Won = recordChapter2Victory(ch1Won, 200_000_000, 'A');
  assert.equal(ch2Won.unlockedChapters.chapter3, true);
  assert.equal(getCarryoverBonusForChapter(ch2Won, 3), 20_000_000);

  // Ghi nhận khi đạt 375M ở Chương 3 -> Hoàn tất chiến dịch
  const ch3Won = recordBoardChapterVictory(ch2Won, 3, 375_000_000, 'S');
  assert.ok(ch3Won.chapter3Victory);
  assert.equal(ch3Won.chapter3Victory?.finalNetWorth, 375_000_000);
});

test('MasterSession: phân quyền truy cập và chuyển đổi Chương chơi', () => {
  const profile = createDefaultProfile();

  assert.equal(canAccessChapter(profile, 1), true);
  assert.equal(canAccessChapter(profile, 2), false);
  assert.equal(canAccessChapter(profile, 3), false);

  // Cố chuyển sang Chương 2 khi chưa mở khóa -> Giữ nguyên Chương 1
  const invalidSwitch = setActiveChapter(profile, 2);
  assert.equal(invalidSwitch.activeChapter, 1);

  // Sau khi thắng Chương 1
  const unlocked = recordChapter1Victory(profile, 92_000_000, 'A');
  assert.equal(canAccessChapter(unlocked, 2), true);

  const switched = setActiveChapter(unlocked, 2);
  assert.equal(switched.activeChapter, 2);
});
