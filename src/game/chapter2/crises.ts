// Danh mục 4 Thẻ Biến Cố Khủng Hoảng F&B Đời Thực cho Chương 2
// Mô phỏng các tình huống thực tế tại thị trường F&B Việt Nam năm 2026.

import type { CoffeeCrisisEvent } from './types.ts';

export const CHAPTER2_CRISIS_EVENTS: CoffeeCrisisEvent[] = [
  {
    id: 'CRISIS_TIKTOK_REVIEWER',
    monthTarget: 1,
    title: 'Reviewer 1 Sao Bóc Phốt "Nước Ngọt Gắt"',
    context: 'Một TikToker ẩm thực 1.2M follower đăng clip chê bạc xỉu của quán "uống như nước đường hóa học, đá tan hết vẫn gắt cổ". Video đạt 250k view và hàng trăm bình luận hoang mang!',
    urgencyLevel: 'high',
    options: [
      {
        id: 'A',
        label: 'Đăng clip cầu thị cảm ơn & mời reviewer trải nghiệm lại công thức mới',
        cashImpactImmediate: -2_000_000, // Chi phí voucher & làm video chất lượng
        dailyCupsDelta: 0,
        satisfactionDelta: 15,
        takeawayLesson: 'Biến khủng hoảng thành cơ hội: Sự chân thành và cầu thị trong F&B luôn chiếm trọn cảm tình khách hàng hơn là né tránh.',
      },
      {
        id: 'B',
        label: 'Im lặng không tương tác, đợi bão mạng tự lắng xuống',
        cashImpactImmediate: 0,
        dailyCupsDelta: -15, // Khách vãng lai hoang mang né quán
        satisfactionDelta: -5,
        takeawayLesson: 'Im lặng trước dư luận khiến khách hàng mặc định tin đồn là thật, làm xói mòn doanh số âm thầm.',
      },
      {
        id: 'C',
        label: 'Bình luận đôi co, dọa kiện vì cho rằng quán bị đối thủ thuê chơi xấu',
        cashImpactImmediate: -5_000_000, // Thuê xử lý khủng hoảng truyền thông
        dailyCupsDelta: -25,
        satisfactionDelta: -20,
        takeawayLesson: 'Đôi co với khách hàng trên mạng xã hội là "án tử" nhanh nhất cho các thương hiệu ăn uống bán lẻ.',
      },
    ],
  },
  {
    id: 'CRISIS_POWER_OUTAGE',
    monthTarget: 2,
    title: 'Cúp Điện Đột Xuất Trưa Hè 38°C',
    context: 'Trạm biến áp khu phố quá tải chập cháy, mất điện toàn bộ từ 11h30 đến 15h. Quán đang đông nghịt dân văn phòng tìm chỗ tránh nóng nghỉ trưa!',
    urgencyLevel: 'critical',
    options: [
      {
        id: 'A',
        label: 'Thuê gấp máy phát điện công suất lớn (3.000.000 VND/ngày)',
        cashImpactImmediate: -3_000_000,
        dailyCupsDelta: 5,
        satisfactionDelta: 10,
        takeawayLesson: 'Duy trì dịch vụ xuyên suốt giữa sự cố tạo nên sự tin cậy tuyệt đối và biến khách vãng lai thành khách trung thành.',
      },
      {
        id: 'B',
        label: 'Chuyển sang bán Cà phê ủ lạnh Cold Brew & Trà trái cây đóng chai có sẵn',
        cashImpactImmediate: 0,
        dailyCupsDelta: -10,
        satisfactionDelta: 5,
        takeawayLesson: 'Sự linh hoạt trong thực đơn cứu vãn doanh số mà không phải chi trả thêm định phí phát sinh đột ngột.',
      },
      {
        id: 'C',
        label: 'Đóng cửa cho nhân viên dọn dẹp nghỉ sớm',
        cashImpactImmediate: 0,
        dailyCupsDelta: -25,
        satisfactionDelta: -10,
        takeawayLesson: 'Đóng cửa vào giờ vàng khiến khách quen thất vọng tìm quán khác, làm đứt gãy thói quen ghé quán mỗi ngày.',
      },
    ],
  },
  {
    id: 'CRISIS_WORKSHOP_ORDER',
    monthTarget: 2,
    title: 'Đơn Đột Biến: 200 Ly Cafe Giao Gấp Trong 1 Giờ',
    context: 'Tòa nhà công nghệ bên cạnh tổ chức hội thảo đột xuất, đặt gấp 200 ly cafe sữa & cold brew giao trong 60 phút. Giá trị đơn hàng lớn nhưng dễ gây nghẽn quầy!',
    urgencyLevel: 'opportunity',
    options: [
      {
        id: 'A',
        label: 'Huy động toàn bộ nhân viên quầy, pha chế thần tốc giao đúng hẹn',
        cashImpactImmediate: 7_000_000, // Doanh thu gộp đơn hàng lớn
        dailyCupsDelta: 10,
        satisfactionDelta: 10,
        takeawayLesson: 'Nắm bắt các đơn hàng số lượng lớn (B2B) giúp cải thiện biên lợi nhuận và mở rộng tệp khách hàng văn phòng.',
      },
      {
        id: 'B',
        label: 'Từ chối đơn để tập trung phục vụ chu đáo khách tại bàn',
        cashImpactImmediate: 0,
        dailyCupsDelta: 0,
        satisfactionDelta: 0,
        takeawayLesson: 'Hiểu rõ giới hạn công suất giúp bảo toàn chất lượng phục vụ cốt lõi, tránh rủi ro vỡ trận.',
      },
      {
        id: 'C',
        label: 'Nhận đơn nhưng giao trễ 45 phút khiến khách hội thảo bức xúc',
        cashImpactImmediate: 4_000_000, // Bị phạt hợp đồng vì trễ giờ
        dailyCupsDelta: -5,
        satisfactionDelta: -15,
        takeawayLesson: 'Tham nhận vượt quá năng lực vận hành sẽ đánh mất uy tín thương hiệu và chịu phạt hợp đồng nặng nề.',
      },
    ],
  },
  {
    id: 'CRISIS_FOOD_SAFETY_INSPECTION',
    monthTarget: 3,
    title: 'Đoàn Thanh Tra VSATTP Ghé Thăm Đột Xuất',
    context: 'Đội kiểm tra liên ngành kiểm tra đột xuất nguồn gốc xuất xứ hạt cà phê, hồ sơ lưu mẫu nguyên liệu và hạn sử dụng các loại siro, sữa tươi tại quầy bar.',
    urgencyLevel: 'high',
    options: [
      {
        id: 'A',
        label: 'Xuất trình đầy đủ chứng nhận hạt VietGAP, hóa đơn VAT và sổ kiểm thực 3 bước',
        cashImpactImmediate: 0,
        dailyCupsDelta: 10,
        satisfactionDelta: 10,
        takeawayLesson: 'Minh bạch pháp lý và an toàn vệ sinh thực phẩm là tấm lá chắn bảo vệ quán vững chắc trước mọi đợt thanh tra.',
      },
      {
        id: 'B',
        label: 'Bị phát hiện 2 hộp sữa tươi cận date chưa kịp dán nhãn phân loại theo quy định',
        cashImpactImmediate: -4_000_000, // Nộp phạt hành chính
        dailyCupsDelta: 0,
        satisfactionDelta: -5,
        takeawayLesson: 'Nguyên tắc quản lý kho FIFO (Nhập trước - Xuất trước) cần được nhân viên tuân thủ nghiêm ngặt từng ngày.',
      },
      {
        id: 'C',
        label: 'Thiếu giấy khám sức khỏe của 1 bạn nhân viên part-time mới vào quầy',
        cashImpactImmediate: -2_500_000, // Nộp phạt
        dailyCupsDelta: 0,
        satisfactionDelta: 0,
        takeawayLesson: 'Nhân sự tiếp xúc trực tiếp với thực phẩm bắt buộc phải có chứng nhận sức khỏe hợp lệ trước khi được đứng quầy.',
      },
    ],
  },
];

/**
 * Lấy Thẻ Biến Cố phù hợp theo tháng nếu chưa được giải quyết.
 */
export function getCrisisForMonth(month: 1 | 2 | 3, resolvedIds: string[]): CoffeeCrisisEvent | null {
  const available = CHAPTER2_CRISIS_EVENTS.filter(
    (c) => c.monthTarget === month && !resolvedIds.includes(c.id)
  );
  if (available.length === 0) return null;
  return available[0];
}
