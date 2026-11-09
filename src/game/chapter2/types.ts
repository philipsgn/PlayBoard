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
  phase: 'briefing' | 'decisions' | 'crisis' | 'barista_rush' | 'monthly_settlement' | 'chapter_result';
  outcome?: CoffeeShopOutcome;
}
