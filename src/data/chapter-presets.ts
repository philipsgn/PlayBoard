export type BoardChapterId = 1 | 2 | 3;

export interface BoardChapterPreset {
  chapterId: BoardChapterId;
  title: string;
  subtitle: string;
  description: string;
  baseStartingCapital: number;
  maxCarryoverBonus: number;
  targetGoal: number;
  totalLaps: number;
  recurringIncome: number;
  baseLivingCost: number;
  livingInflationPerLap: number;
  safeEmergencyBuffer: number;
  borrowingLimit: number;
  eventScaleMultiplier: number;
  enableDelayedConsequences: boolean;
  enableMarginCall: boolean;
  marginCallThreshold: number;
  marginTargetRatio: number;
  marginLiquidationPenalty: number;
}

export const BOARD_CHAPTER_PRESETS: Record<BoardChapterId, BoardChapterPreset> = {
  1: {
    chapterId: 1,
    title: 'Chương 1: Khởi Đầu Tích Lũy',
    subtitle: 'Kỷ luật thanh khoản & Quỹ dự phòng 10M',
    description: 'Nhận 50M vốn ban đầu trên bàn cờ B18 (4 vòng = 4 Quý). Học cách giữ đệm tiền mặt 10M, tránh phạt rút tiết kiệm sớm và tích lũy tối thiểu 90M VND hợp lệ.',
    baseStartingCapital: 50_000_000,
    maxCarryoverBonus: 0,
    targetGoal: 90_000_000,
    totalLaps: 4,
    recurringIncome: 14_000_000,
    baseLivingCost: 5_000_000,
    livingInflationPerLap: 0,
    safeEmergencyBuffer: 10_000_000,
    borrowingLimit: 30_000_000,
    eventScaleMultiplier: 1.0,
    enableDelayedConsequences: false,
    enableMarginCall: false,
    marginCallThreshold: 1.0,
    marginTargetRatio: 0.5,
    marginLiquidationPenalty: 0,
  },
  2: {
    chapterId: 2,
    title: 'Chương 2: Đòn Bẩy Tăng Trưởng',
    subtitle: 'Lạm phát lũy tiến & Thẻ tình huống hệ quả trễ',
    description: 'Khởi đầu từ 90M (+ tối đa 15M vốn thưởng kế thừa). Đối mặt với lạm phát sinh hoạt phí tăng +1M mỗi vòng, rủi ro trái phiếu V2.5 và các quyết định có hệ quả trễ để chinh phục mốc 180M VND.',
    baseStartingCapital: 90_000_000,
    maxCarryoverBonus: 15_000_000,
    targetGoal: 180_000_000,
    totalLaps: 4,
    recurringIncome: 20_000_000,
    baseLivingCost: 8_000_000,
    livingInflationPerLap: 1_000_000,
    safeEmergencyBuffer: 15_000_000,
    borrowingLimit: 60_000_000,
    eventScaleMultiplier: 1.5,
    enableDelayedConsequences: true,
    enableMarginCall: false,
    marginCallThreshold: 1.0,
    marginTargetRatio: 0.5,
    marginLiquidationPenalty: 0,
  },
  3: {
    chapterId: 3,
    title: 'Chương 3: Bão Vĩ Mô & Tự Do Tài Chính',
    subtitle: 'Chu kỳ 5 vòng, Đòn bẩy & Bẫy Call Margin',
    description: 'Chặng đỉnh cao với vốn 180M (+ tối đa 30M vốn thưởng kế thừa) qua 5 vòng chu kỳ kinh tế. Sử dụng đòn bẩy khôn ngoan, phòng vệ Call Margin (> 60%) và tất toán danh mục hợp lệ đạt 360M VND.',
    baseStartingCapital: 180_000_000,
    maxCarryoverBonus: 30_000_000,
    targetGoal: 360_000_000,
    totalLaps: 5,
    recurringIncome: 28_000_000,
    baseLivingCost: 12_000_000,
    livingInflationPerLap: 1_500_000,
    safeEmergencyBuffer: 25_000_000,
    borrowingLimit: 120_000_000,
    eventScaleMultiplier: 2.2,
    enableDelayedConsequences: true,
    enableMarginCall: true,
    marginCallThreshold: 0.60,
    marginTargetRatio: 0.45,
    marginLiquidationPenalty: 0.05,
  },
};

export function getChapterPreset(chapterId: BoardChapterId = 1): BoardChapterPreset {
  return BOARD_CHAPTER_PRESETS[chapterId] ?? BOARD_CHAPTER_PRESETS[1];
}
