# PlayBoard Financial Engine Rules (3-Chapter Monopoly Investment Boardgame)

Bộ quy tắc bắt buộc khi phát triển, mở rộng hoặc bảo trì cỗ máy tính toán tài chính (`src/game/**` và `src/data/**`) của dự án **PlayBoard**.

---

## 1. Kiến Trúc Tầng Engine Thuần Khiết (Pure TypeScript Domain)

1. **Zero UI/DOM Imports:** Tuyệt đối không import `react`, `react-dom`, `three`, CSS hoặc bất kỳ Web DOM API nào vào `src/game/**` (ngoại trừ `localStorage` có kiểm tra `typeof window !== 'undefined'` trong `saved-game.ts` và `master-session.ts`).
2. **100% Số Nguyên VND (`Integer VND Only`):**
   - Mọi giá trị tiền tệ trong `portfolio`, `deposits`, `bondLots`, `pendingPayment` và `LogEntry` bắt buộc phải là số nguyên VND (`Number.isSafeInteger`).
   - Sử dụng `Math.round()` hoặc `Math.floor()` ngay tại thời điểm tính phí giao dịch, spread vàng, lãi tiết kiệm, coupon trái phiếu hoặc chiết khấu Call Margin.
3. **Deterministic Seed-based RNG (`src/game/random.ts`):**
   - Tuyệt đối không dùng `Math.random()` trong luồng gameplay (`engine.ts`, `market.ts`, `settlement.ts`, `bond-credit.ts`).
   - Mọi biến cố, giá thị trường và kết quả xúc xắc phải đi qua `draw(state)` để đảm bảo replay log tái hiện chính xác 100%.

---

## 2. Quy Chuẩn 3 Chương Bàn Cờ & 6 Bẫy Tài Chính (`src/data/chapter-presets.ts`)

1. **Chương 1 (`chapterId: 1` — Khởi Đầu Tích Lũy):**
   - Vốn khởi điểm `50.000.000 VND`, mục tiêu huy động hợp lệ `90.000.000 VND`, 4 vòng, lương `14.000.000 VND`, sinh hoạt phí `5.000.000 VND`, đệm khẩn cấp `10.000.000 VND`, hạn mức vay `30.000.000 VND`.
   - Khi khởi tạo Chương 1 không có `carryoverBonus`, snapshot phải giữ nguyên tương thích 100% với chuẩn `core-mvp-b18-multi-course-v1`.
2. **Chương 2 (`chapterId: 2` — Đòn Bẩy Tăng Trưởng):**
   - Vốn cơ sở `90.000.000 VND` + `Capped Carryover ≤ +15.000.000 VND` (tối đa `105.000.000 VND`), mục tiêu `180.000.000 VND`, 4 vòng, lương `20.000.000 VND`.
   - Sinh hoạt phí cơ sở `8.000.000 VND` + **Lạm phát lũy tiến `+1.000.000 VND/vòng`**.
   - Mở khóa **Thẻ Tình Huống Hệ Quả Trễ (`delayedEffects`)**: Bảo hiểm Phòng vệ (`insuredLapsRemaining`) và Cắt giảm chi phí bảo trì (`businessRevenuePenaltyNextLap` làm giảm 35% dòng tiền kinh doanh kỳ sau).
3. **Chương 3 (`chapterId: 3` — Bão Vĩ Mô & Tự Do Tài Chính):**
   - Vốn cơ sở `180.000.000 VND` + `Capped Carryover ≤ +30.000.000 VND` (tối đa `210.000.000 VND`), mục tiêu `360.000.000 VND`, **5 vòng**, lương `28.000.000 VND`.
   - Sinh hoạt phí cơ sở `12.000.000 VND` + **Lạm phát lũy tiến `+1.500.000 VND/vòng`**.
   - Mở khóa **Vay Đòn Bẩy (`borrowingLimit = 120.000.000 VND`) & Cưỡng Chế Call Margin**: Khi `debt / liquidCollateralValue > 0.60`, tự động bán Cổ phiếu/Vàng (chịu phạt thanh lý cưỡng bức `5%`) để hạ tỷ lệ đòn bẩy về ngưỡng an toàn `45%`.
4. **Công Thức Nguồn Huy Động Hợp Lệ (`liquidatableFunds`):**
   - Chỉ tính: `Tiền mặt + Gốc tiết kiệm đang hoạt động + Giá bán ròng Cổ phiếu/Trái phiếu/Vàng (sau phí & spread) - Nợ vay - Nghĩa vụ tồn đọng`.
   - Tuyệt đối không tính Tiệm kinh doanh chưa bán hoặc lãi tiết kiệm chưa đáo hạn vào điều kiện thắng.
