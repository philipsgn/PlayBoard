/**
 * BINDINGS: ÁNH XẠ TRỰC TIẾP TỪ GAME STATE SANG VẬT THỂ ẨN DỤ 3D
 * Module chuyển đổi thuần túy (pure adapter), không lưu giữ state riêng.
 */

import type { GameState } from '../../../../../src/game/types.ts';
import { netWorth } from '../../../../../src/game/selectors.ts';
import type { VisualMetaphors, TimeOfDay } from '../types.ts';

export const GOAL_TARGET_AMOUNT = 90_000_000;
export const MAX_SAFE_DEBT = 25_000_000;
export const DEBT_CAP = 30_000_000;

/**
 * Trích xuất các chỉ số ẩn dụ trực quan (Visual Metaphors) từ GameState.
 * Hàm thuần túy (pure function), an toàn tuyệt đối khi game undefined/null.
 */
export function extractVisualMetaphors(game?: GameState | null): VisualMetaphors {
  if (!game || !game.portfolio) {
    return {
      coinHeight: 0.5,
      coinCount: 5,
      debtChainLinks: 0,
      isDebtCritical: false,
      goalProgressRatio: 0.35,
      goalAchieved: false,
      timeOfDay: 'morning',
      lap: 1,
      cash: 30_000_000,
      debt: 0,
      netWorth: 30_000_000,
    };
  }

  const cash = Math.max(0, game.portfolio.cash || 0);
  const debt = Math.max(0, game.portfolio.debt || 0);
  const totalNet = Math.max(0, netWorth(game.portfolio));
  const lap = Math.min(4, Math.max(1, game.lap || 1));

  // 1. Chồng xu tiền mặt: 0 đ -> 0.1, 10M -> 0.3, 50M -> 0.8, 90M+ -> 1.5
  const coinHeight = Math.min(1.5, Math.max(0.1, Number((cash / 60_000_000).toFixed(2))));
  const coinCount = Math.min(15, Math.max(1, Math.round(coinHeight * 10)));

  // 2. Dây xích nợ: tỷ lệ nợ trên hạn mức trần 30M
  const debtRatio = Math.min(1.0, debt / DEBT_CAP);
  const debtChainLinks = Math.round(debtRatio * 10);
  const isDebtCritical = debt >= MAX_SAFE_DEBT;

  // 3. Tiến độ tích lũy vốn 90M
  const goalProgressRatio = Math.min(1.0, Math.max(0, totalNet / GOAL_TARGET_AMOUNT));
  const goalAchieved = totalNet >= GOAL_TARGET_AMOUNT;

  // 4. Ánh sáng/Thời điểm trong ngày theo vòng (1 -> morning, 2 -> noon, 3 -> afternoon, 4 -> night)
  const timeMapping: Record<number, TimeOfDay> = {
    1: 'morning',
    2: 'noon',
    3: 'afternoon',
    4: 'night',
  };
  const timeOfDay = timeMapping[lap] || 'night';

  return {
    coinHeight,
    coinCount,
    debtChainLinks,
    isDebtCritical,
    goalProgressRatio,
    goalAchieved,
    timeOfDay,
    lap,
    cash,
    debt,
    netWorth: totalNet,
  };
}
