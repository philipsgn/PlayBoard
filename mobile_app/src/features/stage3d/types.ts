/**
 * TYPES: HỆ THỐNG DIORAMA 3D "HÀNH TRÌNH CỦA MINH" (STAGE 3D)
 * Định nghĩa hợp đồng dữ liệu cho lớp 3D bán trong suốt kẹp giữa bàn cờ B18.
 */

import type { GameState } from '../../../../src/game/types.ts';

export type TimeOfDay = 'morning' | 'noon' | 'afternoon' | 'night';

export interface VisualMetaphors {
  /** Chiều cao tương đối của chồng xu tiền mặt cạnh quân cờ (0.0 -> 1.5) */
  coinHeight: number;
  /** Số lượng đồng xu 3D xếp chồng (0 -> 15) */
  coinCount: number;
  /** Số lượng mắt xích nợ neo vào chân quân cờ (0 -> 10) */
  debtChainLinks: number;
  /** Trạng thái nợ nguy cấp (>= 25M VND, mắt xích chuyển sang đỏ rực) */
  isDebtCritical: boolean;
  /** Tỷ lệ tiến độ tích lũy vốn 90M (0.0 -> 1.0) */
  goalProgressRatio: number;
  /** Đã chạm mốc tự do tài chính 90M VND */
  goalAchieved: boolean;
  /** Thời điểm trong ngày theo Vòng chơi (Lap 1 -> 4) */
  timeOfDay: TimeOfDay;
  /** Số vòng chơi hiện tại (1 -> 4) */
  lap: number;
  /** Vốn tiền mặt thực tế */
  cash: number;
  /** Tổng nợ hiện tại */
  debt: number;
  /** Tổng tài sản ròng */
  netWorth: number;
}

export interface Chapter3DTheme {
  id: 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5';
  title: string;
  ambientColor: number;
  ambientIntensity: number;
  sunColor: number;
  sunIntensity: number;
  sunPosition: [number, number, number];
  particleType: 'dust' | 'rain' | 'steam' | 'confetti';
}

export interface Stage3DProps {
  game?: GameState | null;
  pawnCoord?: { x: number; y: number };
  chapterId?: 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5';
  lowPerformanceMode?: boolean;
}
