# CHƯƠNG 2: ĐÒN BẨY TĂNG TRƯỞNG (PLAYBOARD B18 — CHAPTER 2)
## TÀI LIỆU THIẾT KẾ GAME & CƠ CHẾ HỆ QUẢ TRỄ (GDD)
**Chủ sở hữu:** Phát (Owner & Lead Game Developer)  

---

## 1. TỔNG QUAN & THÔNG SỐ KINH TẾ CHƯƠNG 2

Sau khi vượt qua Chương 1 với tổng nguồn huy động hợp lệ $\ge 90.000.000\text{ VND}$, người chơi bước vào Chương 2 trên bàn cờ 18 ô (`B18`) với quy mô vốn gấp đôi và áp lực lạm phát leo thang:

- **Vốn khởi điểm cơ sở:** `90.000.000 VND`.
- **Vốn thưởng kế thừa (`Capped Carryover`):** Tối đa `+15.000.000 VND` từ phần thặng dư vượt 90M ở Chương 1 $\rightarrow$ Tổng vốn đầu vào từ `90.000.000` đến `105.000.000 VND`.
- **Mục tiêu chiến thắng:** Nguồn huy động hợp lệ cuối Vòng 4 **$\ge 180.000.000\text{ VND}$**.
- **Số vòng chơi:** 4 Vòng.
- **Lương cơ bản qua `START`:** `20.000.000 VND/vòng` (có thể nâng thêm qua 2 khóa học kỹ năng).
- **Lạm phát Sinh hoạt phí Lũy tiến:**
  - Vòng 1: `8.000.000 VND`
  - Vòng 2: `9.000.000 VND`
  - Vòng 3: `10.000.000 VND`
  - Vòng 4: `11.000.000 VND`
- **Đệm khẩn cấp an toàn (`safeEmergencyBuffer`):** `15.000.000 VND`.
- **Hạn mức vay (`borrowingLimit`):** `60.000.000 VND` (Mở tính năng vay đòn bẩy chủ động `borrowLeverage`).
- **Quy mô biến cố cá nhân (`eventScaleMultiplier`):** `1.5x` so với Chương 1.

---

## 2. THỬ THÁCH ĐẶC TRƯNG: THẺ TÌNH HUỐNG HỆ QUẢ TRỄ (`delayedEffects`)

1. **Bài Toán Bảo Hiểm Phòng Vệ vs. Rủi Ro Biến Cố (`activate-insurance`):**
   - Khi gặp sự kiện y tế (`medical`), người chơi có thể chọn trả thêm `+3.000.000 VND` để kích hoạt **Gói Bảo Hiểm Phòng Vệ** có hiệu lực trong 2 vòng kế tiếp (`insuredLapsRemaining = 2`).
   - Khi đang có bảo hiểm, nếu dẫm vào bất kỳ ô `Biến cố cá nhân` nào (`medical`, `repair`, `family`), người chơi được chọn phương án **`Dùng Bảo hiểm Phòng vệ (0 ₫)`** để miễn nhiễm 100% thiệt hại.
2. **Bài Toán Cắt Giảm Chi Phí Bảo Trì Ngắn Hạn (`defer-maintenance`):**
   - Khi thiếu tiền mặt hoặc muốn gom tiền đầu tư gấp, người chơi có thể chọn phương án **`Cắt giảm chi phí bảo trì tiệm (+3.000.000 ₫)`** để nhận ngay `+3M VND` tiền mặt.
   - **Hệ quả trễ:** Cờ `businessRevenuePenaltyNextLap = true` được bật, khiến dòng tiền Tiệm kinh doanh tại kỳ quyết toán `START` tiếp theo bị sụt giảm **`35%`**.
