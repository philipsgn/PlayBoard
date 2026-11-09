// Pure Economic Formulas & Financial P&L Calculator cho Quán Cà Phê
// Bám sát công thức quản trị tài chính thực tế năm 2026 tại Việt Nam.

import type { FixedCostBreakdown, MonthlyPnLStatement, CoffeeShopState } from './types.ts';

export const DAYS_IN_MONTH = 30;

/**
 * Tính tổng định phí cố định hàng tháng (Fixed Costs).
 */
export function calculateTotalFixedCosts(fixed: FixedCostBreakdown): number {
  return (
    Math.round(fixed.rent) +
    Math.round(fixed.labor) +
    Math.round(fixed.utilities) +
    Math.round(fixed.equipmentDepreciation) +
    Math.round(fixed.equipmentRental)
  );
}

/**
 * Tính số ly bán ra cần thiết mỗi ngày để đạt điểm hòa vốn (Break-even Cups Daily).
 * Công thức: Fixed Costs / (30 ngày * (Giá bán mỗi ly - Biến phí mỗi ly))
 */
export function calculateBreakEvenCupsDaily(
  totalFixedCosts: number,
  averageOrderValue: number,
  variableCostRatio: number
): number {
  const contributionMarginPerCup = averageOrderValue * (1 - variableCostRatio);
  if (contributionMarginPerCup <= 0) return 9999; // Không thể hòa vốn nếu biến phí >= giá bán
  
  const monthlyCupsNeeded = totalFixedCosts / contributionMarginPerCup;
  return Math.ceil(monthlyCupsNeeded / DAYS_IN_MONTH);
}

/**
 * Tính toán Bảng Báo Cáo Lỗ Lãi (P&L Statement) trọn vẹn trong tháng.
 */
export function generateMonthlyPnL(state: CoffeeShopState): MonthlyPnLStatement {
  const monthlyCups = Math.round(state.dailyCupsSold * DAYS_IN_MONTH);
  const revenue = Math.round(monthlyCups * state.averageOrderValue);
  
  // COGS (Giá vốn hàng bán = Biến phí)
  const cogs = Math.round(revenue * state.variableCostRatio);
  const grossProfit = revenue - cogs;
  
  // Tổng định phí
  const totalFixedCosts = calculateTotalFixedCosts(state.fixedCosts);
  const netProfit = grossProfit - totalFixedCosts;
  
  // Tiền mặt lưu động cuối kỳ sau khi cộng/trừ lãi lỗ vận hành tháng này
  const cashEnding = state.cash + netProfit;
  
  // Số ly hòa vốn
  const breakEvenCupsDaily = calculateBreakEvenCupsDaily(
    totalFixedCosts,
    state.averageOrderValue,
    state.variableCostRatio
  );
  
  return {
    month: state.month,
    revenue,
    cogs,
    grossProfit,
    fixedCosts: totalFixedCosts,
    netProfit,
    cashEnding,
    breakEvenCupsDaily,
    isBreakEven: netProfit >= 0,
  };
}

/**
 * Tính Runway tiền mặt (số tháng quán còn có thể cầm cự nếu tiếp tục chịu lỗ).
 * Nếu netProfit >= 0 (đã có lãi): Runway = Infinity
 */
export function calculateCashRunway(cash: number, netProfit: number): number {
  if (netProfit >= 0) return Infinity;
  const burnRate = Math.abs(netProfit);
  if (burnRate === 0) return Infinity;
  return Number((cash / burnRate).toFixed(1));
}
