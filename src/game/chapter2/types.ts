// Contracts & Data Models cho Chương 2: Khởi Nghiệp Quán Cà Phê (Coffee Shop Simulator)
// TypeScript thuần túy, không nhập DOM/UI, tuân thủ nguyên tắc Real-world RL 2026.

export interface FixedCostBreakdown {
  rent: number;                  // Tiền thuê mặt bằng hàng tháng (VND)
  labor: number;                 // Tổng lương cứng nhân sự hàng tháng (VND)
  utilities: number;             // Điện, nước, internet cơ bản (VND)
  equipmentDepreciation: number; // Khấu hao thiết bị hàng tháng (VND)
  equipmentRental: number;       // Phí thuê máy móc nếu chọn thuê (VND)
}

export interface MonthlyPnLStatement {
  month: number;                 // 1, 2, 3
  revenue: number;               // Doanh thu: Số ly/ngày * 30 * Giá bán TB
  cogs: number;                  // Giá vốn hàng bán (Biến phí nguyên vật liệu)
  grossProfit: number;           // Lợi nhuận gộp: Doanh thu - COGS
  fixedCosts: number;            // Tổng định phí hoạt động
  netProfit: number;             // Lợi nhuận ròng: Lợi nhuận gộp - Định phí
  cashEnding: number;            // Tiền mặt lưu động cuối kỳ
  breakEvenCupsDaily: number;    // Số ly cần bán mỗi ngày để hòa vốn
  isBreakEven: boolean;          // Đạt điểm hòa vốn (Lợi nhuận ròng >= 0)
}

export interface DecisionOption {
  id: 'A' | 'B' | 'C';
  label: string;
  cashImpactImmediate: number;   // Tiền mặt chi trả ngay tức thời (VND)
  fixedCostDelta?: {             // Tác động lên các khoản định phí hàng tháng
    rent?: number;
    labor?: number;
    utilities?: number;
    equipmentDepreciation?: number;
    equipmentRental?: number;
  };
  equipmentValueDelta?: number;  // Thay đổi giá trị tài sản thiết bị
  dailyCupsDelta: number;        // Tác động lên số ly bán ra mỗi ngày
  satisfactionDelta: number;     // Tác động lên độ hài lòng khách hàng (-100..+100)
  cogsRatioDelta: number;        // Tác động lên tỷ lệ giá vốn (ví dụ: -0.02 là giảm 2% giá vốn)
  takeawayLesson: string;        // Bài học tài chính thực tế rút ra
}

export interface DecisionCard {
  id: string;
  month: 1 | 2 | 3;
  order: number;                 // Thứ tự 1..4 trong tháng
  title: string;
  context: string;
  category: 'equipment' | 'operations' | 'marketing' | 'emergency';
  options: DecisionOption[];
}

export interface CrisisOption {
  id: 'A' | 'B' | 'C';
  label: string;
  cashImpactImmediate: number;   // Tiền mặt chi trả hoặc thu về ngay (VND)
  dailyCupsDelta: number;        // Tác động lên số ly bán ra mỗi ngày
  satisfactionDelta: number;     // Tác động lên độ hài lòng khách hàng (-100..+100)
  takeawayLesson: string;        // Bài học tài chính/vận hành thực tế
}

export interface CoffeeCrisisEvent {
  id: string;
  monthTarget?: 1 | 2 | 3;
  title: string;
  context: string;
  urgencyLevel: 'high' | 'critical' | 'opportunity';
  options: CrisisOption[];
}

export interface CoffeeShopOutcome {
  victory: boolean;
  reason: string;
  finalNetProfit: number;
  finalRunwayMonths: number;
  carryoverCash: number;
  brandReputation: number;
}

// 1. Kho Nguyên Liệu Thực Chiến (Tồn kho & Định mức F&B 2026)
export interface CoffeeInventory {
  beansRobustaKg: number;    // Hạt Robusta Lâm Đồng (kg)
  beansArabicaKg: number;    // Hạt Arabica Cầu Đất (kg)
  milkSpecialLiters: number; // Sữa tươi tiệt trùng / Dalat Milk (lít)
  condensedMilkCans: number; // Sữa đặc Ông Thọ (lon)
  flavorSyrupUnits: number;  // Muối hồng, syrup & phụ liệu (phần)
}

// 2. Cấp Độ Thiết Bị & Quầy Bar 3D
export interface EquipmentLevels {
  espressoMachineLevel: 1 | 2 | 3; // 1: Single Group, 2: Dual Group Inox, 3: Multi-Boiler Pro
  grinderLevel: 1 | 2;             // 1: Hopper cơ bản, 2: Precision Burr Grinder
  pastryCabinet: boolean;          // Tủ kính 3 tầng bánh ngọt Croissant
  ambianceLighting: boolean;       // Đèn thả trần vàng ấm
}

// 3. Đơn Hàng Thức Uống Ca Trực 3D Vận Hành
export interface DrinkOrder {
  id: string;
  customerName: string;
  drinkName: string; // 'Cà phê sữa đá' | 'Bạc xỉu' | 'Cà phê muối' | 'Espresso Doppio' | 'Cold brew cam sả'
  icon: string;
  recipe: {
    beanType: 'robusta' | 'arabica';
    requireMilk: boolean;
    requireFlavor: boolean;
  };
  price: number;
  tipPotential: number;
  patienceMax: number; // Giây kiên nhẫn
}

// 4. Chỉ Số Kinh Tế Vận Hành (Masterprompt Operational Metrics)
export interface OperationalMetrics {
  quality: number;      // 0..100: Chất lượng thức uống (ảnh hưởng giá bán & độ hài lòng)
  speed: number;        // 0..100: Tốc độ phục vụ (ảnh hưởng năng suất giờ cao điểm)
  capacity: number;     // 0..100: Sức chứa chỗ ngồi quán phòng (quyết định số khách ngồi lại)
  satisfaction: number; // 0..100: Độ hài lòng tổng thể không gian & phục vụ
}

export interface CoffeeShopState {
  month: 1 | 2 | 3;
  cash: number;                  // Tiền mặt lưu động hiện có (VND)
  capitalInvested: number;       // Vốn kinh doanh chuẩn ban đầu (90.000.000 VND)
  bonusRunwayCash: number;       // Quỹ dự phòng thặng dư chuyển từ Chương 1
  equipmentValue: number;        // Giá trị máy móc thiết bị hiện có
  dailyCupsSold: number;         // Lượng ly bán ra trung bình mỗi ngày
  averageOrderValue: number;     // Giá bán trung bình mỗi ly (mặc định 35.000 VND)
  customerSatisfaction: number;  // Độ hài lòng khách hàng (0..100)
  fixedCosts: FixedCostBreakdown;
  variableCostRatio: number;     // Tỷ lệ biến phí trên doanh thu (ví dụ 0.30 = 30%)
  
  // 4 Chỉ Số Kinh Tế Vận Hành Cốt Lõi (Coffee & Wealth 100M)
  metrics: OperationalMetrics;
  targetWealthGoal: number;      // Mốc tài sản hướng tới (100.000.000 VND)
  emergencyFundBuffer: number;   // Ngưỡng Quỹ Khẩn Cấp an toàn (10.000.000 VND)
  reachedMilestones: number[];   // Danh sách các mốc đã chạm: [25M, 50M, 75M, 100M]
  
  // Trạng thái Thử thách Hư Hỏng Thiết Bị 3D (The Breakdown)
  breakdownActive: boolean;      // Máy pha bốc khói đen
  wrenchRepairActive: boolean;   // Barista đang cầm cờ lê vặn ốc
  
  // Quản lý Kho & Thiết Bị Tycoon 2026
  inventory: CoffeeInventory;
  equipment: EquipmentLevels;
  monthRestockSpent: number;     // Tổng tiền đã chi nhập kho trong tháng
  monthUpgradeSpent: number;     // Tổng tiền đã chi nâng cấp thiết bị trong tháng
  
  // Ca Trực 3D Giờ Cao Điểm (Work Shift)
  workShiftOrders?: DrinkOrder[];
  workShiftCompleted?: boolean;
  workShiftEarnings?: number;
  workShiftTips?: number;

  // Tiến trình đưa ra quyết định
  activeDecisions: string[];     // Danh sách ID các quyết định đã chọn
  currentCardIndex: number;      // 0..3: Vị trí thẻ quyết định trong tháng hiện tại
  monthlyPnL: MonthlyPnLStatement[];
  
  // Biến cố bất ngờ & Mini-game Giờ Cao Điểm
  activeCrisis?: CoffeeCrisisEvent | null;
  resolvedCrisisIds: string[];
  baristaRushCompleted?: boolean;
  lastRushTip?: number;
  
  // Trạng thái vòng đời tháng
  phase: 'briefing' | 'inventory_shop' | 'decisions' | 'crisis' | 'work_shift_3d' | 'barista_rush' | 'monthly_settlement' | 'chapter_result';
  outcome?: CoffeeShopOutcome;
}
