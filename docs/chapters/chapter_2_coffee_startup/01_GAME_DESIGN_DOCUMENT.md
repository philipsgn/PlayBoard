# CHƯƠNG 2: KHỞI NGHIỆP QUÁN CÀ PHÊ (COFFEE SHOP SIMULATOR)
## TÀI LIỆU THIẾT KẾ GAME & LOGIC TÌNH HUỐNG (GDD)
**Phiên bản:** 2.0 (Chuẩn Vận Hành F&B Thực Tế & Cozy Tycoon 2026)  
**Tác giả:** Senior Game Manager Creator 2026  
**Dự án:** PlayBoard — Game Giáo Dục Tài Chính Cá Nhân & Khởi Nghiệp  

---

## 1. TỔNG QUAN GAME & MỤC TIÊU CỐT LÕI

### 1.1. Tuyên Bố Sứ Mệnh (Game Vision)
Chương 2 mô phỏng chân thực bài toán khởi nghiệp F&B: **"Vượt qua 3 tháng đầu sóng gió để không sạt nghiệp"**.
Người chơi sử dụng số vốn tích lũy được từ Chương 1 (**90.000.000 VND** vốn chuẩn kèm quỹ dự phòng thặng dư) để mở một quán cà phê specialty/take-away. Khác với những game clicker nhàn rỗi, Chương 2 kết hợp phong cách **Cozy Shop Tycoon vui nhộn, gây nghiện** (*Good Pizza, Great Pizza*, *Boba Story*) với các **công thức tài chính F&B thực tế tại Việt Nam năm 2026**: kiểm soát dòng tiền, tiền thuê mặt bằng, biến phí nguyên liệu hạt/sữa, khấu hao máy móc, và chỉ số sống còn Runway tiền mặt.

### 1.2. Mốc Chiến Thắng & Thất Bại (Win/Lose Conditions)
- **Thời lượng thử thách:** **3 Tháng Đầu Tiên** (Tháng 1: Thiết lập & Khai trương, Tháng 2: Vận hành & Cú sốc chi phí, Tháng 3: Tối ưu & Vượt ngưỡng).
- **Điều kiện CHIẾN THẮNG (Victory):**
  1. Quán duy trì hoạt động đến hết Tháng thứ 3 mà không bị phá sản ($\text{Tiền mặt} > 0$).
  2. Tại Tháng thứ 3, quán đạt **Điểm Hòa Vốn (Break-even)** hoặc có lãi ròng dương:
     $$\text{Lợi nhuận ròng Tháng 3} \ge 0\text{ VND}$$
  3. Chỉ số Hài Lòng Khách Hàng (Customer Satisfaction) $\ge 70/100$.
  $\rightarrow$ *Phần thưởng:* Mở khóa **Chương 3: Mở Rộng Chuỗi & Nhượng Quyền**.
- **Điều kiện THẤT BẠI (Game Over):**
  - Hết sạch tiền mặt tại bất kỳ thời điểm nào ($\text{Cash} \le 0$) và không thể chi trả tiền thuê mặt bằng hoặc lương nhân viên (Runway = 0).
  - Điểm hài lòng khách hàng rơi xuống dưới 30/100 (quán bị tẩy chay vì chất lượng quá tệ).

---

## 2. CÔNG THỨC KINH TẾ HỌC F&B THỰC CHIẾN (FINANCIAL FORMULAS)

### 2.1. Doanh Thu Bán Hàng (Monthly Revenue)
$$\text{Doanh thu} = \text{Số lượng ly bán ra / ngày} \times \text{Giá bán trung bình (AOV)} \times 30\text{ ngày}$$
- *Ví dụ chuẩn:* 80 ly/ngày $\times$ 35.000 VND/ly $\times$ 30 ngày = `84.000.000 VND/tháng`.

### 2.2. Chi Phí Hoạt Động (Cost Structure)
Tổng chi phí chia làm 2 phần rõ rệt:
1. **Chi phí cố định (Fixed Costs - Định phí):**
   $$\text{Định phí} = \text{Tiền thuê mặt bằng} + \text{Lương cứng nhân viên} + \text{Khấu hao máy móc} + \text{Điện nước cơ bản}$$
   - *Đặc điểm:* Dù bán được 0 ly hay 1.000 ly thì cuối tháng vẫn phải thanh toán đủ 100%.
2. **Chi phí biến đổi (Variable Costs / COGS - Biến phí):**
   $$\text{Biến phí} = \text{Chi phí hạt cafe, sữa tươi, siro, ly, ống hút, đá} + \text{Điện theo sản lượng}$$
   - *Tỷ lệ biến phí tiêu chuẩn ngành cafe:* Thường chiếm **28% – 35%** trên giá bán 1 ly cafe.

### 2.3. Lợi Nhuận Gộp & Lợi Nhuận Ròng (Gross & Net Profit)
- **Lợi nhuận gộp (Gross Profit):**
  $$\text{Gross Profit} = \text{Doanh thu} - \text{Biến phí (COGS)}$$
- **Lợi nhuận ròng (Net Profit):**
  $$\text{Net Profit} = \text{Gross Profit} - \text{Định phí}$$

### 2.4. Điểm Hòa Vốn (Break-even Point)
Số doanh thu tối thiểu phải đạt để bù đắp toàn bộ chi phí mà không bị lỗ:
$$\text{Doanh thu hòa vốn} = \frac{\text{Định phí}}{1 - \text{Tỷ lệ biến phí}}$$
$$\text{Số ly cafe cần bán mỗi ngày} = \frac{\text{Doanh thu hòa vốn}}{\text{Giá bán trung bình} \times 30}$$

### 2.5. Chỉ Số Runway Tiền Mặt (Cash Runway)
$$\text{Runway (Tháng)} = \frac{\text{Tiền mặt dự trữ}}{\text{Mức lỗ ròng hàng tháng (Monthly Burn Rate)}}$$
- Nếu quán đang lỗ 15M/tháng và tiền mặt chỉ còn 30M, Runway là `2 tháng` $\rightarrow$ Báo động đỏ! Người chơi phải cắt giảm định phí hoặc tăng doanh thu khẩn cấp.

---

## 3. DANH MỤC 12 THẺ QUYẾT ĐỊNH TÌNH HUỐNG (DECISION CARDS)

Mỗi tháng người chơi lần lượt trải qua 4 thẻ quyết định:
- **Tháng 1 (Khởi tạo & Đầu tư):**
  - Card 1: Chọn mặt bằng (Đường lớn vs Hẻm vs Kiosk mang đi).
  - Card 2: Trang bị máy pha cà phê (Máy mới 100% vs Máy lướt vs Thuê máy).
  - Card 3: Tuyển dụng nhân sự (Barista chuyên nghiệp vs Sinh viên part-time vs Tự đứng quầy).
  - Card 4: Nhà cung ứng hạt cà phê (Specialty Arabica vs Blend Robusta vs Hạt giá rẻ).
- **Tháng 2 (Vận hành & Mở rộng):**
  - Card 5: Chiến dịch kích cầu (Mua 1 tặng 1 vs Thuê KOLs review vs Voucher tích điểm).
  - Card 6: Xử lý phản hồi khách hàng (Đồ uống nhạt vs Đổi công thức vs Tặng bánh kèm).
  - Card 7: Quản trị kho nguyên liệu (Cài phần mềm POS định lượng vs Kiểm kê thủ công).
  - Card 8: Tối ưu chi phí điện lạnh mùa nắng nóng (Lắp điều hòa Inverter vs Quạt phun sương).
- **Tháng 3 (Vượt bão & Chốt sổ):**
  - Card 9: Đối thủ chuỗi lớn mở sát vách (Combo bữa sáng vs Cuộc chiến giảm giá vs Tăng cường dịch vụ thân thiết).
  - Card 10: Sự cố hỏng máy pha 8h sáng thứ Hai (Gọi thợ sửa tốc hành vs Tự sửa mất trọn buổi sáng).
  - Card 11: Giá hạt Robusta tăng 20% (Tăng giá bán vs Đàm phán nhà cung ứng dài hạn vs Thay đổi công thức).
  - Card 12: Cơ hội hợp tác bán chéo tiệm bánh (Ký thỏa thuận bán chéo vs Từ chối vì sợ phức tạp).

---

## 4. BỘ 4 THẺ BIẾN CỐ KHỦNG HOẢNG F&B ĐỜI THỰC (CRISIS EVENTS)

Biến cố kích hoạt tự động sau quyết định thứ 2 của mỗi tháng:
1. **`CRISIS_TIKTOK_REVIEWER` (Tháng 1):** Reviewer 1 Sao Bóc Phốt "Nước Ngọt Gắt".
   - *A (Cầu thị):* Làm clip xin lỗi, mời khách quay lại trải nghiệm (-2M, +15% hài lòng).
   - *B (Im lặng):* Không tương tác, khách vãng lai né quán (-15 ly/ngày, -5% hài lòng).
   - *C (Đôi co):* Đôi co mạng xã hội (-5M, -25 ly/ngày, -20% hài lòng).
2. **`CRISIS_POWER_OUTAGE` (Tháng 2):** Cúp Điện Đột Xuất Trưa Hè 38°C.
   - *A (Thuê máy phát):* Chi trả 3M máy phát điện khẩn cấp (-3M, +5 ly/ngày, +10% hài lòng).
   - *B (Cold Brew):* Bán cà phê đóng chai có sẵn (0đ, -10 ly/ngày, +5% hài lòng).
   - *C (Đóng cửa):* Nghỉ trưa sớm (0đ, -25 ly/ngày, -10% hài lòng).
3. **`CRISIS_WORKSHOP_ORDER` (Tháng 2):** Đơn Đột Biến 200 Ly Hội Thảo Tech.
   - *A (Toàn lực):* Pha chế thần tốc giao đúng hẹn (+7M VND, +10 ly/ngày, +10% hài lòng).
   - *B (Từ chối):* Tập trung khách tại bàn (0đ, an toàn).
   - *C (Giao trễ):* Nhận quá tải giao trễ 45 phút (+4M VND, -5 ly/ngày, -15% hài lòng).
4. **`CRISIS_FOOD_SAFETY_INSPECTION` (Tháng 3):** Đoàn Thanh Tra VSATTP Ghé Thăm Đột Xuất.
   - *A (VietGAP chuẩn):* Xuất trình đủ hồ sơ chứng từ (0đ, +10 ly/ngày, +10% hài lòng).
   - *B (Sữa cận date):* Phạt hành chính thiếu tem dán (-4M, -5% hài lòng).
   - *C (Thiếu giấy khám):* Phạt thiếu giấy khám sức khỏe nhân viên (-2.5M).

---

## 5. MINI-GAME TƯƠNG TÁC XÚC GIÁC "GIỜ CAO ĐIỂM" (BARISTA RUSH)

Diễn ra ở cuối Tháng 1 và Tháng 2 trước khi in Bill P&L:
- **Bước 1 — Cân lượng hạt (Dosing):** Chạm giữ nút xả hạt, nhả tay đúng vạch chuẩn `18.0g - 20.0g`.
- **Bước 2 — Canh áp suất chiết xuất (Pressure Gauge):** Kim đo dao động 0-15 bar, bấm chiết xuất đúng vùng vàng `8.5 - 9.5 bar`.
- **Bước 3 — Đổ bọt sữa nghệ thuật (Latte Art):** Canh độ mịn bọt sữa `75% - 95%` để tạo hình trái tim.
- **Thang điểm thưởng tài chính:**
  - 🌟 **3/3 Perfect (Barista Siêu Hạng):** Thưởng tiền Tip tức thì `+1.500.000 VND` + Buff vĩnh viễn `+15 ly/ngày`!
  - 👍 **2/3 Good (Tay Nghề Chắc Chắn):** Thưởng Tip `+800.000 VND` + Buff `+8 ly/ngày`.
  - ☕ **1/3 Pass (Đạt Tiêu Chuẩn):** Thưởng Tip `+300.000 VND`.

---

## 6. THIẾT KẾ TRẢI NGHIỆM COZY SHOP TYCOON

1. **Khách hàng Chibi tương tác:** Nhân vật Chibi vector với 4 trạng thái cảm xúc (Bình thường, Thả tim sung sướng, Toát mồ hôi lo lắng, Khách cho tiền tip).
2. **Quầy bar ấm áp:** Máy pha cà phê hoạt họa, tách cà phê bốc khói mờ ảo (`@keyframes coffeeSteamFlow`).
3. **Hũ tiền Tip leng keng (`Tip Jar`):** Chạm vào hũ phát ra âm thanh đồng xu leng keng giòn giã.
4. **Hạt nảy số (Particle Burst):** Số tiền `+1.5M VND` hoặc tim `+15% ❤️` bay lên khi đưa ra quyết định hoặc hoàn thành mini-game.
5. **Top HUD Chubby Badges:** Bo tròn 999px phong cách kẹo ngọt, hiển thị rõ Tiền mặt, Ly/ngày, Hài lòng, và Runway.
