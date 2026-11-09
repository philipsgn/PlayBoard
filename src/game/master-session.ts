// MasterSessionManager: Lớp điều phối dữ liệu trung tâm (Single Source of Truth)
// Quản lý hồ sơ người chơi toàn ván, cơ chế mở khóa và chuyển giao thành quả vốn giữa 3 Chương.

export const MASTER_PROFILE_KEY = 'playboard_master_player_profile_v1';
export const BASE_STARTING_CAPITAL_CH2 = 90_000_000; // 90M VND chuẩn theo GDD
export const WINNING_THRESHOLD_CH1 = 90_000_000;    // Điều kiện chiến thắng Chương 1

export interface Chapter1Carryover {
  finalNetWorth: number;          // Số tiền tích lũy được (>= 90.000.000 VND)
  startingCapitalForCh2: number;  // 90.000.000 VND vốn kinh doanh chuẩn
  bonusRunwayCash: number;        // Max(0, finalNetWorth - 90M) làm đệm dự phòng
  totalInitialCashForCh2: number; // startingCapitalForCh2 + bonusRunwayCash
  financialHealthGrade: 'S' | 'A' | 'B' | 'C' | 'D';
  completedAt: number;
}

export interface Chapter2Carryover {
  finalMonthlyCashflow: number;   // Dòng tiền thặng dư hàng tháng
  accumulatedCash: number;        // Tiền mặt dự trữ chuyển sang mở chuỗi
  brandReputation: number;        // Điểm uy tín thương hiệu (0..100)
  completedAt: number;
}

export interface MasterPlayerProfile {
  playerId: string;
  playerName: string;
  createdAt: number;
  lastActive: number;
  
  // Trạng thái mở khóa & Tiến độ 3 Chương
  unlockedChapters: {
    chapter1: boolean; // Mặc định: true
    chapter2: boolean; // Mở khóa khi Thắng Ch1 (Total Worth >= 90M)
    chapter3: boolean; // Mở khóa khi Thắng Ch2 (Hòa vốn & Lợi nhuận dương)
  };
  activeChapter: 1 | 2 | 3;
  
  // Dữ liệu chuyển giao thành quả (Carryover)
  carryoverFromChapter1?: Chapter1Carryover;
  carryoverFromChapter2?: Chapter2Carryover;
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
 * Tính toán vốn chuyển giao động từ Chương 1 sang Chương 2.
 * - 90M VND làm vốn mở quán chuẩn.
 * - Phần thặng dư vượt mức (> 90M) được chuyển toàn bộ thành Quỹ Dự Phòng Lưu Động (Runway Bonus).
 */
export function calculateChapter1Carryover(
  finalNetWorth: number,
  healthGrade: 'S' | 'A' | 'B' | 'C' | 'D' = 'A'
): Chapter1Carryover {
  const bonusRunwayCash = Math.max(0, finalNetWorth - WINNING_THRESHOLD_CH1);
  return {
    finalNetWorth,
    startingCapitalForCh2: BASE_STARTING_CAPITAL_CH2,
    bonusRunwayCash,
    totalInitialCashForCh2: BASE_STARTING_CAPITAL_CH2 + bonusRunwayCash,
    financialHealthGrade: healthGrade,
    completedAt: Date.now(),
  };
}

/**
 * Ghi nhận chiến thắng Chương 1, mở khóa Chương 2 và tính toán vốn chuyển giao.
 */
export function recordChapter1Victory(
  profile: MasterPlayerProfile,
  finalNetWorth: number,
  healthGrade: 'S' | 'A' | 'B' | 'C' | 'D' = 'A'
): MasterPlayerProfile {
  if (finalNetWorth < WINNING_THRESHOLD_CH1) {
    // Không đủ điều kiện thắng 90M, không mở khóa Chương 2
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
 * Kiểm tra xem người chơi có quyền truy cập vào Chương chỉ định hay không.
 */
export function canAccessChapter(profile: MasterPlayerProfile, chapter: 1 | 2 | 3): boolean {
  if (chapter === 1) return profile.unlockedChapters.chapter1;
  if (chapter === 2) return profile.unlockedChapters.chapter2;
  if (chapter === 3) return profile.unlockedChapters.chapter3;
  return false;
}

/**
 * Chuyển chương đang hoạt động (Active Chapter).
 */
export function setActiveChapter(profile: MasterPlayerProfile, chapter: 1 | 2 | 3): MasterPlayerProfile {
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
