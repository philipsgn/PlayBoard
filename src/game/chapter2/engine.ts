// Micro-Engine cốt lõi cho Chương 2: Khởi Nghiệp Quán Cà Phê (Coffee Shop Simulator)
// Vận hành theo mô hình State Machine bất biến (Immutable State Reducer), bám sát GDD 2026.

import type { CoffeeShopState, DecisionCard, CoffeeShopOutcome } from './types.ts';
import { CHAPTER2_DECISION_CARDS } from './cards.ts';
import { generateMonthlyPnL, calculateCashRunway } from './pnl.ts';

export const DEFAULT_CAPITAL_CH2 = 90_000_000;
export const DEFAULT_AVERAGE_ORDER_VALUE = 35_000; // 35.000 VND / ly

/**
 * Khởi tạo ván chơi mới cho Chương 2.
 * @param initialCapital Vốn khởi nghiệp chuẩn (mặc định 90.000.000 VND)
 * @param bonusRunwayCash Quỹ dự phòng thặng dư chuyển giao từ Chương 1 (nếu có)
 */
export function createCoffeeShopGame(
  initialCapital: number = DEFAULT_CAPITAL_CH2,
  bonusRunwayCash: number = 0
): CoffeeShopState {
  const totalStartingCash = Math.round(initialCapital + bonusRunwayCash);

  return {
    month: 1,
    cash: totalStartingCash,
    capitalInvested: Math.round(initialCapital),
    bonusRunwayCash: Math.round(bonusRunwayCash),
    equipmentValue: 0,
    dailyCupsSold: 25, // Lượng ly ban đầu trước khi triển khai các phương án
    averageOrderValue: DEFAULT_AVERAGE_ORDER_VALUE,
    customerSatisfaction: 70, // Điểm hài lòng ban đầu
    fixedCosts: {
      rent: 0,
      labor: 0,
      utilities: 2_500_000, // Tiền điện nước cơ bản mặt bằng
      equipmentDepreciation: 0,
      equipmentRental: 0,
    },
    variableCostRatio: 0.30, // 30% giá vốn nguyên vật liệu chuẩn
    activeDecisions: [],
    currentCardIndex: 0,
    monthlyPnL: [],
    phase: 'decisions',
  };
}

/**
 * Lấy Thẻ Quyết Định Tình Huống hiện tại theo tiến trình của tháng.
 */
export function getCurrentCard(state: CoffeeShopState): DecisionCard | null {
  if (state.phase !== 'decisions') return null;
  const currentOrder = state.currentCardIndex + 1;
  const card = CHAPTER2_DECISION_CARDS.find(
    (c) => c.month === state.month && c.order === currentOrder
  );
  return card || null;
}

/**
 * Áp dụng một quyết định vào trạng thái của quán (Immutable Reducer).
 */
export function applyDecision(
  state: CoffeeShopState,
  optionId: 'A' | 'B' | 'C'
): CoffeeShopState {
  if (state.phase !== 'decisions') return state;
  const card = getCurrentCard(state);
  if (!card) return state;

  const option = card.options.find((o) => o.id === optionId);
  if (!option) return state;

  // 1. Tác động tiền mặt tức thời (Capex / chi phí phạt / cọc)
  const nextCash = state.cash + option.cashImpactImmediate;

  // 2. Cập nhật cơ cấu định phí hàng tháng
  const nextFixedCosts = { ...state.fixedCosts };
  if (option.fixedCostDelta) {
    if (option.fixedCostDelta.rent !== undefined) {
      nextFixedCosts.rent = Math.max(0, nextFixedCosts.rent + option.fixedCostDelta.rent);
    }
    if (option.fixedCostDelta.labor !== undefined) {
      nextFixedCosts.labor = Math.max(0, nextFixedCosts.labor + option.fixedCostDelta.labor);
    }
    if (option.fixedCostDelta.utilities !== undefined) {
      nextFixedCosts.utilities = Math.max(0, nextFixedCosts.utilities + option.fixedCostDelta.utilities);
    }
    if (option.fixedCostDelta.equipmentDepreciation !== undefined) {
      nextFixedCosts.equipmentDepreciation = Math.max(
        0,
        nextFixedCosts.equipmentDepreciation + option.fixedCostDelta.equipmentDepreciation
      );
    }
    if (option.fixedCostDelta.equipmentRental !== undefined) {
      nextFixedCosts.equipmentRental = Math.max(
        0,
        nextFixedCosts.equipmentRental + option.fixedCostDelta.equipmentRental
      );
    }
  }

  // 3. Cập nhật giá trị thiết bị
  const nextEquipmentValue = Math.max(
    0,
    state.equipmentValue + (option.equipmentValueDelta ?? 0)
  );

  // 4. Cập nhật lượng ly bán ra mỗi ngày & độ hài lòng
  const nextDailyCups = Math.max(5, state.dailyCupsSold + option.dailyCupsDelta);
  const nextSatisfaction = Math.max(
    0,
    Math.min(100, state.customerSatisfaction + option.satisfactionDelta)
  );

  // 5. Cập nhật tỷ lệ biến phí
  const nextVariableCostRatio = Math.max(
    0.15,
    Math.min(0.60, Number((state.variableCostRatio + option.cogsRatioDelta).toFixed(3)))
  );

  const nextActiveDecisions = [...state.activeDecisions, `${card.id}_${option.id}`];
  const nextCardIndex = state.currentCardIndex + 1;

  // Nếu đã giải quyết đủ 4 thẻ trong tháng, chuyển sang bước Kết toán P&L cuối tháng
  const nextPhase = nextCardIndex >= 4 ? 'monthly_settlement' : 'decisions';

  return {
    ...state,
    cash: nextCash,
    fixedCosts: nextFixedCosts,
    equipmentValue: nextEquipmentValue,
    dailyCupsSold: nextDailyCups,
    customerSatisfaction: nextSatisfaction,
    variableCostRatio: nextVariableCostRatio,
    activeDecisions: nextActiveDecisions,
    currentCardIndex: nextCardIndex,
    phase: nextPhase,
  };
}

/**
 * Đánh giá kết quả chung cuộc của Chương 2 sau khi hoàn tất 3 tháng.
 */
export function evaluateChapter2Outcome(state: CoffeeShopState): CoffeeShopOutcome {
  const lastPnL = state.monthlyPnL[state.monthlyPnL.length - 1];
  const isSolvent = state.cash > 0;
  const isBreakEven = lastPnL ? lastPnL.isBreakEven : false;
  const netProfit = lastPnL ? lastPnL.netProfit : 0;
  const runway = calculateCashRunway(state.cash, netProfit);

  if (!isSolvent) {
    return {
      victory: false,
      reason: 'Quán đã cạn kiệt toàn bộ tiền mặt dự trữ (Runway = 0) và phá sản trước khi đạt điểm hòa vốn.',
      finalNetProfit: netProfit,
      finalRunwayMonths: 0,
      carryoverCash: 0,
      brandReputation: state.customerSatisfaction,
    };
  }

  if (isBreakEven && netProfit > 0) {
    return {
      victory: true,
      reason: `Chúc mừng! Quán cà phê đã vượt qua 3 tháng đầu sóng gió, đạt điểm hòa vốn xuất sắc với lợi nhuận ròng +${netProfit.toLocaleString('vi-VN')} VND/tháng!`,
      finalNetProfit: netProfit,
      finalRunwayMonths: runway,
      carryoverCash: state.cash,
      brandReputation: state.customerSatisfaction,
    };
  }

  if (isBreakEven && netProfit === 0) {
    return {
      victory: true,
      reason: 'Quán vừa vặn đạt điểm hòa vốn chính xác. Bạn đã bảo toàn được hoạt động kinh doanh để mở rộng sang Chương 3!',
      finalNetProfit: 0,
      finalRunwayMonths: Infinity,
      carryoverCash: state.cash,
      brandReputation: state.customerSatisfaction,
    };
  }

  return {
    victory: false,
    reason: `Quán vẫn chịu lỗ vận hành (${netProfit.toLocaleString('vi-VN')} VND/tháng) sau 3 tháng và chưa đạt điểm hòa vốn cần thiết.`,
    finalNetProfit: netProfit,
    finalRunwayMonths: runway,
    carryoverCash: state.cash,
    brandReputation: state.customerSatisfaction,
  };
}

/**
 * Thực hiện kỳ kết toán P&L cuối tháng và chuyển sang tháng tiếp theo hoặc kết thúc ván.
 */
export function executeMonthlySettlement(state: CoffeeShopState): CoffeeShopState {
  if (state.phase !== 'monthly_settlement') return state;

  // Tính toán P&L tháng này
  const pnl = generateMonthlyPnL(state);
  const updatedMonthlyPnL = [...state.monthlyPnL, pnl];
  const endingCash = pnl.cashEnding;

  // Kiểm tra cạn kiệt tiền mặt (Vỡ nợ / Phá sản)
  if (endingCash <= 0) {
    const outcome: CoffeeShopOutcome = {
      victory: false,
      reason: `Quán cạn kiệt tiền mặt ở Tháng ${state.month} và không đủ khả năng thanh toán chi phí vận hành.`,
      finalNetProfit: pnl.netProfit,
      finalRunwayMonths: 0,
      carryoverCash: 0,
      brandReputation: state.customerSatisfaction,
    };
    return {
      ...state,
      cash: endingCash,
      monthlyPnL: updatedMonthlyPnL,
      phase: 'chapter_result',
      outcome,
    };
  }

  // Nếu là Tháng 3 (tháng cuối cùng của Chương 2), đánh giá chiến thắng chung cuộc
  if (state.month === 3) {
    const tempState: CoffeeShopState = {
      ...state,
      cash: endingCash,
      monthlyPnL: updatedMonthlyPnL,
    };
    const outcome = evaluateChapter2Outcome(tempState);
    return {
      ...tempState,
      phase: 'chapter_result',
      outcome,
    };
  }

  // Chuyển sang tháng tiếp theo
  const nextMonth = (state.month + 1) as 2 | 3;
  return {
    ...state,
    month: nextMonth,
    cash: endingCash,
    currentCardIndex: 0,
    monthlyPnL: updatedMonthlyPnL,
    phase: 'decisions',
  };
}
