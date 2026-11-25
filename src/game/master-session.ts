// MasterSessionManager: Lớp điều phối dữ liệu trung tâm (Single Source of Truth)
// Quản lý hồ sơ người chơi toàn ván, cơ chế mở khóa và chuyển giao vốn Capped Carryover
// giữa 3 Chương Bàn Cờ Tỷ Phú Đầu Tư Tài Chính (50M -> 90M -> 180M -> 360M VND).

import { BOARD_CHAPTER_PRESETS, type BoardChapterId } from '../data/chapter-presets.ts';

export const MASTER_PROFILE_KEY = 'playboard_master_player_profile_v1';
export const BASE_STARTING_CAPITAL_CH2 = BOARD_CHAPTER_PRESETS[2].baseStartingCapital; // 90.000.000 VND
export const BASE_STARTING_CAPITAL_CH3 = BOARD_CHAPTER_PRESETS[3].baseStartingCapital; // 180.000.000 VND
export const WINNING_THRESHOLD_CH1 = BOARD_CHAPTER_PRESETS[1].targetGoal;              // 90.000.000 VND
export const WINNING_THRESHOLD_CH2 = BOARD_CHAPTER_PRESETS[2].targetGoal;              // 180.000.000 VND
export const WINNING_THRESHOLD_CH3 = BOARD_CHAPTER_PRESETS[3].targetGoal;              // 360.000.000 VND
export const MAX_CARRYOVER_CH1_TO_CH2 = BOARD_CHAPTER_PRESETS[2].maxCarryoverBonus;    // +15.000.000 VND
export const MAX_CARRYOVER_CH2_TO_CH3 = BOARD_CHAPTER_PRESETS[3].maxCarryoverBonus;    // +30.000.000 VND

export type FinancialGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface Chapter1Carryover {
  finalNetWorth: number;          // Nguồn huy động hợp lệ đạt được ở Chương 1 (>= 90.000.000 VND)
  startingCapitalForCh2: number;  // 90.000.000 VND vốn chuẩn Chương 2
  bonusRunwayCash: number;        // Tổng thặng dư thực tế vượt 90M: Max(0, finalNetWorth - 90M)
  cappedBonusForCh2: number;      // Thặng dư có trần chuyển sang Chương 2: Min(15M, bonusRunwayCash)
  totalInitialCashForCh2: number; // startingCapitalForCh2 + bonusRunwayCash
  playableStartingCashCh2: number;// startingCapitalForCh2 + cappedBonusForCh2 (90M..105M)
  prestigeGemsEarned: number;     // Phần vượt trần quy đổi thành Gems danh vọng
  financialHealthGrade: FinancialGrade;
  completedAt: number;
}

export interface Chapter2Carryover {
  finalNetWorth: number;          // Nguồn huy động hợp lệ đạt được ở Chương 2 (>= 180.000.000 VND)
  startingCapitalForCh3: number;  // 180.000.000 VND vốn chuẩn Chương 3
  rawSurplusCash: number;         // Max(0, finalNetWorth - 180M)
  cappedBonusForCh3: number;      // Thặng dư có trần chuyển sang Chương 3: Min(30M, rawSurplusCash)
  playableStartingCashCh3: number;// 180M + cappedBonusForCh3 (180M..210M)
  prestigeGemsEarned: number;
  financialHealthGrade: FinancialGrade;
  completedAt: number;
}

export interface Chapter3VictoryRecord {
  finalNetWorth: number;          // Nguồn huy động hợp lệ đạt được ở Chương 3 (>= 360.000.000 VND)
  financialHealthGrade: FinancialGrade;
  completedAt: number;
}

export interface MasterPlayerProfile {
  playerId: string;
  playerName: string;
  createdAt: number;
  lastActive: number;

  // Trạng thái mở khóa & Tiến độ 3 Chương Bàn Cờ
  unlockedChapters: {
    chapter1: boolean; // Mặc định: true (50M -> 90M)
    chapter2: boolean; // Mở khóa khi Thắng Ch1 (Huy động hợp lệ >= 90M)
    chapter3: boolean; // Mở khóa khi Thắng Ch2 (Huy động hợp lệ >= 180M)
  };
  activeChapter: BoardChapterId;

  // Dữ liệu chuyển giao thành quả giữa 3 Chương Bàn Cờ
  carryoverFromChapter1?: Chapter1Carryover;
  carryoverFromChapter2?: Chapter2Carryover;
  chapter3Victory?: Chapter3VictoryRecord;
}

export function createDefaultProfile(): MasterPlayerProfile {
  const now = Date.now();
  return {
    playerId: `player_${Math.random().toString(36).slice(2, 9)}`,
    playerName: 'Nhà Đầu Tư Trẻ',
    createdAt: now,
    lastActive: now,
    unlockedChapters: {
      chapter1: true,
      chapter2: false,
      chapter3: false,
    },
    activeChapter: 1,
  };
}

export function loadMasterProfile(): MasterPlayerProfile {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createDefaultProfile();
  }
  try {
    const raw = window.localStorage.getItem(MASTER_PROFILE_KEY);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw) as MasterPlayerProfile;
    if (!parsed || !parsed.unlockedChapters) return createDefaultProfile();
    return parsed;
  } catch {
    return createDefaultProfile();
  }
}

export function saveMasterProfile(profile: MasterPlayerProfile): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    profile.lastActive = Date.now();
    window.localStorage.setItem(MASTER_PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

/**
 * Tính toán vốn chuyển giao từ Chương 1 sang Chương 2:
 * - Vốn cơ sở Chương 2: 90M VND.
 * - Trần cộng thêm (Capped Carryover): tối đa +15M VND (để giữ cân bằng toán học ở Chương 2).
 * - Phần vượt trần được quy đổi thành Gems danh vọng.
 */
export function calculateChapter1Carryover(
  finalNetWorth: number,
  healthGrade: FinancialGrade = 'A'
): Chapter1Carryover {
  const bonusRunwayCash = Math.max(0, finalNetWorth - WINNING_THRESHOLD_CH1);
  const cappedBonusForCh2 = Math.min(MAX_CARRYOVER_CH1_TO_CH2, bonusRunwayCash);
  const overflowCash = Math.max(0, bonusRunwayCash - cappedBonusForCh2);
  const prestigeGemsEarned = Math.floor(overflowCash / 1_000_000) * 5 + 30;
  return {
    finalNetWorth,
    startingCapitalForCh2: BASE_STARTING_CAPITAL_CH2,
    bonusRunwayCash,
    cappedBonusForCh2,
    totalInitialCashForCh2: BASE_STARTING_CAPITAL_CH2 + bonusRunwayCash,
    playableStartingCashCh2: BASE_STARTING_CAPITAL_CH2 + cappedBonusForCh2,
    prestigeGemsEarned,
    financialHealthGrade: healthGrade,
    completedAt: Date.now(),
  };
}

/**
 * Tính toán vốn chuyển giao từ Chương 2 sang Chương 3:
 * - Vốn cơ sở Chương 3: 180M VND.
 * - Trần cộng thêm (Capped Carryover): tối đa +30M VND (tổng vốn đầu vào Chương 3: 180M..210M).
 */
export function calculateChapter2Carryover(
  finalNetWorth: number,
  healthGrade: FinancialGrade = 'A'
): Chapter2Carryover {
  const rawSurplusCash = Math.max(0, finalNetWorth - WINNING_THRESHOLD_CH2);
  const cappedBonusForCh3 = Math.min(MAX_CARRYOVER_CH2_TO_CH3, rawSurplusCash);
  const overflowCash = Math.max(0, rawSurplusCash - cappedBonusForCh3);
  const prestigeGemsEarned = Math.floor(overflowCash / 1_000_000) * 5 + 50;
  return {
    finalNetWorth,
    startingCapitalForCh3: BASE_STARTING_CAPITAL_CH3,
    rawSurplusCash,
    cappedBonusForCh3,
    playableStartingCashCh3: BASE_STARTING_CAPITAL_CH3 + cappedBonusForCh3,
    prestigeGemsEarned,
    financialHealthGrade: healthGrade,
    completedAt: Date.now(),
  };
}

/**
 * Ghi nhận chiến thắng Chương 1 (>= 90M VND), mở khóa Chương 2.
 */
export function recordChapter1Victory(
  profile: MasterPlayerProfile,
  finalNetWorth: number,
  healthGrade: FinancialGrade = 'A'
): MasterPlayerProfile {
  if (finalNetWorth < WINNING_THRESHOLD_CH1) {
    return profile;
  }
  const carryover = calculateChapter1Carryover(finalNetWorth, healthGrade);
  const updated: MasterPlayerProfile = {
    ...profile,
    unlockedChapters: {
      ...profile.unlockedChapters,
      chapter2: true,
    },
    carryoverFromChapter1: carryover,
    lastActive: Date.now(),
  };
  saveMasterProfile(updated);
  return updated;
}

/**
 * Ghi nhận chiến thắng Chương 2 (>= 180M VND), mở khóa Chương 3.
 */
export function recordChapter2Victory(
  profile: MasterPlayerProfile,
  finalNetWorth: number,
  healthGrade: FinancialGrade = 'A'
): MasterPlayerProfile {
  if (finalNetWorth < WINNING_THRESHOLD_CH2) {
    return profile;
  }
  const carryover = calculateChapter2Carryover(finalNetWorth, healthGrade);
  const updated: MasterPlayerProfile = {
    ...profile,
    unlockedChapters: {
      ...profile.unlockedChapters,
      chapter2: true,
      chapter3: true,
    },
    carryoverFromChapter2: carryover,
    lastActive: Date.now(),
  };
  saveMasterProfile(updated);
  return updated;
}

/**
 * Ghi nhận chiến thắng Chương 3 (>= 360M VND).
 */
export function recordChapter3Victory(
  profile: MasterPlayerProfile,
  finalNetWorth: number,
  healthGrade: FinancialGrade = 'S'
): MasterPlayerProfile {
  if (finalNetWorth < WINNING_THRESHOLD_CH3) {
    return profile;
  }
  const updated: MasterPlayerProfile = {
    ...profile,
    chapter3Victory: {
      finalNetWorth,
      financialHealthGrade: healthGrade,
      completedAt: Date.now(),
    },
    lastActive: Date.now(),
  };
  saveMasterProfile(updated);
  return updated;
}

/**
 * Hàm tổng quát ghi nhận chiến thắng cho bất kỳ chương bàn cờ nào (1, 2, hoặc 3).
 */
export function recordBoardChapterVictory(
  profile: MasterPlayerProfile,
  chapterId: BoardChapterId,
  finalNetWorth: number,
  healthGrade: FinancialGrade = 'A'
): MasterPlayerProfile {
  if (chapterId === 1) return recordChapter1Victory(profile, finalNetWorth, healthGrade);
  if (chapterId === 2) return recordChapter2Victory(profile, finalNetWorth, healthGrade);
  return recordChapter3Victory(profile, finalNetWorth, healthGrade);
}

/**
 * Lấy số vốn thưởng kế thừa (Capped Carryover Bonus) cho chương chỉ định.
 */
export function getCarryoverBonusForChapter(
  profile: MasterPlayerProfile,
  chapterId: BoardChapterId
): number {
  if (chapterId === 2) {
    return profile.carryoverFromChapter1?.cappedBonusForCh2 ?? 0;
  }
  if (chapterId === 3) {
    return profile.carryoverFromChapter2?.cappedBonusForCh3 ?? 0;
  }
  return 0;
}

export function canAccessChapter(profile: MasterPlayerProfile, chapter: BoardChapterId): boolean {
  if (chapter === 1) return profile.unlockedChapters.chapter1;
  if (chapter === 2) return profile.unlockedChapters.chapter2;
  if (chapter === 3) return profile.unlockedChapters.chapter3;
  return false;
}

export function setActiveChapter(profile: MasterPlayerProfile, chapter: BoardChapterId): MasterPlayerProfile {
  if (!canAccessChapter(profile, chapter)) {
    return profile;
  }
  const updated: MasterPlayerProfile = {
    ...profile,
    activeChapter: chapter,
    lastActive: Date.now(),
  };
  saveMasterProfile(updated);
  return updated;
}
