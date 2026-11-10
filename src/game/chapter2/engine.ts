// Micro-Engine cốt lõi cho Chương 2: Khởi Nghiệp Quán Cà Phê (Coffee Shop Simulator)
// Vận hành theo mô hình State Machine bất biến (Immutable State Reducer), bám sát GDD 2026.

import type { CoffeeShopState, DecisionCard, CoffeeShopOutcome, DrinkOrder, CoffeeInventory, EquipmentLevels } from './types.ts';
import { CHAPTER2_DECISION_CARDS } from './cards.ts';
import { CHAPTER2_CRISIS_EVENTS, getCrisisForMonth } from './crises.ts';
import { generateMonthlyPnL, calculateCashRunway } from './pnl.ts';

export const DEFAULT_CAPITAL_CH2 = 90_000_000;
export const DEFAULT_AVERAGE_ORDER_VALUE = 35_000; // 35.000 VND / ly

// ==========================================
// A. TYCOON RESTOCK PACKAGES & LOGIC
// ==========================================

export type RestockItemType = 'beansRobusta' | 'beansArabica' | 'condensedMilk' | 'milkSpecial' | 'flavorSyrup';

export interface RestockPackage {
  id: string;
  item: RestockItemType;
  name: string;
  amount: number;
  unit: string;
  cost: number;
  description: string;
}

export const RESTOCK_PACKAGES: RestockPackage[] = [
  {
    id: 'restock_robusta_10kg',
    item: 'beansRobusta',
    name: 'Hạt Robusta Buôn Ma Thuột (10kg)',
    amount: 10,
    unit: 'kg',
    cost: 1_200_000,
    description: 'Vị đậm đà, caffein cao, nguyên liệu vàng cho Cà phê phin và Cà phê sữa đá Sài Gòn.',
  },
  {
    id: 'restock_arabica_5kg',
    item: 'beansArabica',
    name: 'Hạt Arabica Cầu Đất Thượng Hạng (5kg)',
    amount: 5,
    unit: 'kg',
    cost: 1_500_000,
    description: 'Hương hoa trái quả, hậu vị ngọt thanh chuẩn Specialty, tối ưu cho Espresso & Cold brew.',
  },
  {
    id: 'restock_condensed_milk_24',
    item: 'condensedMilk',
    name: 'Thùng Sữa Đặc Ông Thọ (24 lon)',
    amount: 24,
    unit: 'lon',
    cost: 650_000,
    description: 'Béo ngậy truyền thống, không thể thiếu cho Bạc xỉu ba tầng và Cà phê sữa đá.',
  },
  {
    id: 'restock_milk_dalat_12l',
    item: 'milkSpecial',
    name: 'Sữa Tươi Thanh Trùng Dalat Milk (12 lít)',
    amount: 12,
    unit: 'lít',
    cost: 480_000,
    description: 'Độ ngọt tự nhiên và tạo bọt mịn xuất sắc cho Latte, Cappuccino và Foam muối béo.',
  },
  {
    id: 'restock_flavor_syrup_15',
    item: 'flavorSyrup',
    name: 'Set Muối Hồng & Syrup Đường Mía (15 phần)',
    amount: 15,
    unit: 'phần',
    cost: 450_000,
    description: 'Gia vị tạo điểm nhấn cho món Cà phê muối béo ngậy và Cold brew trái cây thanh mát.',
  },
];

// ==========================================
// B. TYCOON EQUIPMENT UPGRADES & 3D SPECS
// ==========================================

export type EquipmentUpgradeType =
  | 'espressoMachine_2'
  | 'espressoMachine_3'
  | 'grinder_2'
  | 'pastryCabinet'
  | 'ambianceLighting';

export interface EquipmentUpgradeInfo {
  type: EquipmentUpgradeType;
  title: string;
  description: string;
  cost: number;
  dailyCupsBuff: number;
  satisfactionBuff: number;
  monthlyDepreciation: number;
}

export const EQUIPMENT_UPGRADES: Record<EquipmentUpgradeType, EquipmentUpgradeInfo> = {
  espressoMachine_2: {
    type: 'espressoMachine_2',
    title: 'Máy Pha Dual-Group Inox Công Nghiệp',
    description: '2 họng pha inox áp suất 9 bar chuẩn Ý, tăng tốc độ phục vụ gấp đôi.',
    cost: 20_000_000,
    dailyCupsBuff: 12,
    satisfactionBuff: 6,
    monthlyDepreciation: 800_000,
  },
  espressoMachine_3: {
    type: 'espressoMachine_3',
    title: 'Máy Pha Multi-Boiler Inox Pro LED',
    description: 'Đa nồi hơi kiểm soát nhiệt độ độc lập, chân đế tích hợp LED sang trọng.',
    cost: 35_000_000,
    dailyCupsBuff: 20,
    satisfactionBuff: 10,
    monthlyDepreciation: 1_400_000,
  },
  grinder_2: {
    type: 'grinder_2',
    title: 'Máy Xay Kỹ Thuật Số Precision Burr',
    description: 'Lưỡi dao phẳng 64mm, định lượng tự động từng gram bột mịn đồng đều.',
    cost: 10_000_000,
    dailyCupsBuff: 8,
    satisfactionBuff: 5,
    monthlyDepreciation: 400_000,
  },
  pastryCabinet: {
    type: 'pastryCabinet',
    title: 'Tủ Kính 3 Tầng Bánh Ngọt Croissant',
    description: 'Tủ kính đặt ngay trên quầy bar, kích thích khách hàng gọi thêm combo đồ ăn kèm.',
    cost: 6_000_000,
    dailyCupsBuff: 10,
    satisfactionBuff: 8,
    monthlyDepreciation: 250_000,
  },
  ambianceLighting: {
    type: 'ambianceLighting',
    title: 'Đèn Thả Trần Đồng Thau Amber Warm',
    description: 'Ánh sáng vàng ấm rọi mặt quầy bar, nâng tầm thẩm mỹ và trải nghiệm check-in.',
    cost: 4_500_000,
    dailyCupsBuff: 6,
    satisfactionBuff: 7,
    monthlyDepreciation: 150_000,
  },
};

// ==========================================
// C. DRINK MENU & WORK SHIFT ORDERS (3D)
// ==========================================

export const MENU_DRINKS: Omit<DrinkOrder, 'id' | 'customerName' | 'patienceMax'>[] = [
  {
    drinkName: 'Cà phê sữa đá Sài Gòn',
    icon: '☕🧊',
    recipe: { beanType: 'robusta', requireMilk: true, requireFlavor: false },
    price: 35_000,
    tipPotential: 15_000,
  },
  {
    drinkName: 'Bạc xỉu ba tầng ngọt ngào',
    icon: '🥛☕',
    recipe: { beanType: 'robusta', requireMilk: true, requireFlavor: false },
    price: 40_000,
    tipPotential: 20_000,
  },
  {
    drinkName: 'Cà phê muối béo ngậy xứ Huế',
    icon: '🧂☕',
    recipe: { beanType: 'robusta', requireMilk: true, requireFlavor: true },
    price: 42_000,
    tipPotential: 25_000,
  },
  {
    drinkName: 'Espresso Doppio Cầu Đất',
    icon: '☕✨',
    recipe: { beanType: 'arabica', requireMilk: false, requireFlavor: false },
    price: 45_000,
    tipPotential: 20_000,
  },
  {
    drinkName: 'Cold brew cam sả thanh mát',
    icon: '🍊🧊',
    recipe: { beanType: 'arabica', requireMilk: false, requireFlavor: true },
    price: 50_000,
    tipPotential: 30_000,
  },
];

const CUSTOMER_NAMES = ['Hương Giang', 'Minh Quân', 'Lan Anh', 'Thành Đạt', 'Bảo Ngọc', 'Hoàng Nam'];

export function generateWorkShiftOrders(month: number): DrinkOrder[] {
  const count = month === 1 ? 3 : month === 2 ? 4 : 5;
  const orders: DrinkOrder[] = [];
  for (let i = 0; i < count; i++) {
    const template = MENU_DRINKS[i % MENU_DRINKS.length];
    orders.push({
      ...template,
      id: `order_m${month}_${i + 1}`,
      customerName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
      patienceMax: 20,
    });
  }
  return orders;
}

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
    inventory: {
      beansRobustaKg: 15,
      beansArabicaKg: 5,
      milkSpecialLiters: 20,
      condensedMilkCans: 15,
      flavorSyrupUnits: 25,
    },
    equipment: {
      espressoMachineLevel: 1,
      grinderLevel: 1,
      pastryCabinet: false,
      ambianceLighting: false,
    },
    monthRestockSpent: 0,
    monthUpgradeSpent: 0,
    workShiftOrders: [],
    workShiftCompleted: false,
    workShiftEarnings: 0,
    workShiftTips: 0,
    activeDecisions: [],
    currentCardIndex: 0,
    monthlyPnL: [],
    activeCrisis: null,
    resolvedCrisisIds: [],
    baristaRushCompleted: false,
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
 * Kích hoạt Thẻ Biến Cố Khủng Hoảng theo tháng (Immutable Reducer).
 */
export function triggerCrisis(
  state: CoffeeShopState,
  crisisId?: string
): CoffeeShopState {
  if (state.phase !== 'decisions') return state;
  const crisis = crisisId
    ? CHAPTER2_CRISIS_EVENTS.find((c) => c.id === crisisId)
    : getCrisisForMonth(state.month, state.resolvedCrisisIds);

  if (!crisis) return state;

  return {
    ...state,
    activeCrisis: crisis,
    phase: 'crisis',
  };
}

/**
 * Giải quyết Thẻ Biến Cố Khủng Hoảng bằng lựa chọn A, B hoặc C.
 */
export function resolveCrisis(
  state: CoffeeShopState,
  optionId: 'A' | 'B' | 'C'
): CoffeeShopState {
  if (state.phase !== 'crisis' || !state.activeCrisis) return state;

  const option = state.activeCrisis.options.find((o) => o.id === optionId);
  if (!option) return state;

  const nextCash = state.cash + option.cashImpactImmediate;
  const nextDailyCups = Math.max(5, state.dailyCupsSold + option.dailyCupsDelta);
  const nextSatisfaction = Math.max(
    0,
    Math.min(100, state.customerSatisfaction + option.satisfactionDelta)
  );

  const nextResolved = [...state.resolvedCrisisIds, state.activeCrisis.id];

  // Trở lại phase decisions hoặc monthly_settlement nếu đã hết thẻ
  const nextPhase = state.currentCardIndex >= 4 ? 'monthly_settlement' : 'decisions';

  return {
    ...state,
    cash: nextCash,
    dailyCupsSold: nextDailyCups,
    customerSatisfaction: nextSatisfaction,
    resolvedCrisisIds: nextResolved,
    activeCrisis: null,
    phase: nextPhase,
  };
}

/**
 * Bắt đầu Mini-game Giờ Cao Điểm (Barista Rush Hour).
 */
export function startBaristaRush(state: CoffeeShopState): CoffeeShopState {
  if (state.phase !== 'monthly_settlement' || state.baristaRushCompleted) return state;
  return {
    ...state,
    phase: 'barista_rush',
  };
}

/**
 * Áp dụng kết quả Mini-game Giờ Cao Điểm.
 * @param score Điểm số hoàn thành: 3 (Perfect), 2 (Good), 1 (Pass), 0 (Fail)
 */
export function applyBaristaRushResult(
  state: CoffeeShopState,
  score: 0 | 1 | 2 | 3
): CoffeeShopState {
  if (state.phase !== 'barista_rush') return state;

  let tip = 0;
  let cupsDelta = 0;

  if (score === 3) {
    tip = 1_500_000;
    cupsDelta = 15;
  } else if (score === 2) {
    tip = 800_000;
    cupsDelta = 8;
  } else if (score === 1) {
    tip = 300_000;
    cupsDelta = 0;
  }

  const nextCash = state.cash + tip;
  const nextDailyCups = Math.max(5, state.dailyCupsSold + cupsDelta);

  return {
    ...state,
    cash: nextCash,
    dailyCupsSold: nextDailyCups,
    lastRushTip: tip,
    baristaRushCompleted: true,
    phase: 'monthly_settlement',
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
    baristaRushCompleted: false,
    monthRestockSpent: 0,
    monthUpgradeSpent: 0,
    workShiftOrders: [],
    workShiftCompleted: false,
    workShiftEarnings: 0,
    workShiftTips: 0,
    phase: 'decisions',
  };
}

// ==========================================
// D. TYCOON INVENTORY & UPGRADE REDUCERS
// ==========================================

/**
 * Nhập một gói nguyên liệu vào kho (Immutable Reducer).
 */
export function restockInventory(
  state: CoffeeShopState,
  packageId: string
): CoffeeShopState {
  const pkg = RESTOCK_PACKAGES.find((p) => p.id === packageId);
  if (!pkg || state.cash < pkg.cost) return state;

  const nextInventory: CoffeeInventory = { ...state.inventory };
  if (pkg.item === 'beansRobusta') nextInventory.beansRobustaKg += pkg.amount;
  else if (pkg.item === 'beansArabica') nextInventory.beansArabicaKg += pkg.amount;
  else if (pkg.item === 'condensedMilk') nextInventory.condensedMilkCans += pkg.amount;
  else if (pkg.item === 'milkSpecial') nextInventory.milkSpecialLiters += pkg.amount;
  else if (pkg.item === 'flavorSyrup') nextInventory.flavorSyrupUnits += pkg.amount;

  return {
    ...state,
    cash: state.cash - pkg.cost,
    inventory: nextInventory,
    monthRestockSpent: state.monthRestockSpent + pkg.cost,
  };
}

/**
 * Nâng cấp một hạng mục thiết bị quầy bar 3D (Immutable Reducer).
 */
export function upgradeEquipment(
  state: CoffeeShopState,
  upgradeType: EquipmentUpgradeType
): CoffeeShopState {
  const info = EQUIPMENT_UPGRADES[upgradeType];
  if (!info || state.cash < info.cost) return state;

  const nextEquipment: EquipmentLevels = { ...state.equipment };
  if (upgradeType === 'espressoMachine_2') {
    if (nextEquipment.espressoMachineLevel >= 2) return state;
    nextEquipment.espressoMachineLevel = 2;
  } else if (upgradeType === 'espressoMachine_3') {
    if (nextEquipment.espressoMachineLevel >= 3) return state;
    nextEquipment.espressoMachineLevel = 3;
  } else if (upgradeType === 'grinder_2') {
    if (nextEquipment.grinderLevel >= 2) return state;
    nextEquipment.grinderLevel = 2;
  } else if (upgradeType === 'pastryCabinet') {
    if (nextEquipment.pastryCabinet) return state;
    nextEquipment.pastryCabinet = true;
  } else if (upgradeType === 'ambianceLighting') {
    if (nextEquipment.ambianceLighting) return state;
    nextEquipment.ambianceLighting = true;
  }

  return {
    ...state,
    cash: state.cash - info.cost,
    equipmentValue: state.equipmentValue + info.cost,
    fixedCosts: {
      ...state.fixedCosts,
      equipmentDepreciation: state.fixedCosts.equipmentDepreciation + info.monthlyDepreciation,
    },
    dailyCupsSold: state.dailyCupsSold + info.dailyCupsBuff,
    customerSatisfaction: Math.min(100, state.customerSatisfaction + info.satisfactionBuff),
    equipment: nextEquipment,
    monthUpgradeSpent: state.monthUpgradeSpent + info.cost,
  };
}

// ==========================================
// E. WORK SHIFT 3D ORDER REDUCERS
// ==========================================

/**
 * Bắt đầu Ca Trực Giờ Cao Điểm 3D.
 */
export function startWorkShift(state: CoffeeShopState): CoffeeShopState {
  const orders = generateWorkShiftOrders(state.month);
  return {
    ...state,
    workShiftOrders: orders,
    workShiftCompleted: false,
    workShiftEarnings: 0,
    workShiftTips: 0,
    phase: 'work_shift_3d',
  };
}

/**
 * Hoàn tất một ly thức uống trong Ca Trực 3D.
 */
export function completeDrinkOrder(
  state: CoffeeShopState,
  orderId: string,
  success: boolean,
  tipEarned: number = 0
): CoffeeShopState {
  const order = state.workShiftOrders?.find((o) => o.id === orderId);
  if (!order) return state;

  const nextInventory: CoffeeInventory = { ...state.inventory };
  if (success) {
    if (order.recipe.beanType === 'robusta') {
      nextInventory.beansRobustaKg = Math.max(0, Number((nextInventory.beansRobustaKg - 0.02).toFixed(3)));
    } else {
      nextInventory.beansArabicaKg = Math.max(0, Number((nextInventory.beansArabicaKg - 0.02).toFixed(3)));
    }
    if (order.recipe.requireMilk) {
      nextInventory.condensedMilkCans = Math.max(0, Number((nextInventory.condensedMilkCans - 0.1).toFixed(2)));
    }
    if (order.recipe.requireFlavor) {
      nextInventory.flavorSyrupUnits = Math.max(0, nextInventory.flavorSyrupUnits - 1);
    }
  }

  const earned = success ? order.price : 0;
  const actualTip = success ? tipEarned : 0;
  const nextCash = state.cash + earned + actualTip;
  const nextSatisfaction = Math.max(
    0,
    Math.min(100, state.customerSatisfaction + (success ? 2 : -3))
  );

  const remainingOrders = (state.workShiftOrders || []).filter((o) => o.id !== orderId);
  const isFinished = remainingOrders.length === 0;

  return {
    ...state,
    cash: nextCash,
    inventory: nextInventory,
    customerSatisfaction: nextSatisfaction,
    workShiftOrders: remainingOrders,
    workShiftEarnings: (state.workShiftEarnings || 0) + earned,
    workShiftTips: (state.workShiftTips || 0) + actualTip,
    workShiftCompleted: isFinished,
    phase: isFinished ? 'monthly_settlement' : 'work_shift_3d',
  };
}
