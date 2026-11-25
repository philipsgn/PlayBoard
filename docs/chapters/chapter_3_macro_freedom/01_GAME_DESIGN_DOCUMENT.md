# CHƯƠNG 3: BÃO VĨ MÔ & TỰ DO TÀI CHÍNH (PLAYBOARD B18 — CHAPTER 3)
## TÀI LIỆU THIẾT KẾ GAME & CƠ CHẾ CALL MARGIN (GDD)
**Chủ sở hữu:** Phát (Owner & Lead Game Developer)  

---

## 1. TỔNG QUAN & THÔNG SỐ KINH TẾ CHƯƠNG 3

Chương 3 là thử thách đỉnh cao của PlayBoard, mô phỏng chu kỳ kinh tế 5 giai đoạn với đòn bẩy tài chính lớn và kỷ luật quản trị rủi ro nghiêm ngặt:

- **Vốn khởi điểm cơ sở:** `180.000.000 VND`.
- **Vốn thưởng kế thừa (`Capped Carryover`):** Tối đa `+30.000.000 VND` từ phần thặng dư vượt 180M ở Chương 2 $\rightarrow$ Tổng vốn đầu vào từ `180.000.000` đến `210.000.000 VND`.
- **Mục tiêu chiến thắng:** Nguồn huy động hợp lệ cuối Vòng 5 **$\ge 360.000.000\text{ VND}$**.
- **Số vòng chơi:** **5 Vòng** (5 pha chu kỳ kinh tế).
- **Lương cơ bản qua `START`:** `28.000.000 VND/vòng`.
- **Lạm phát Sinh hoạt phí Lũy tiến (`12M + 1.5M/vòng`):**
  - Vòng 1: `12.000.000 VND` $\rightarrow$ Vòng 5: `18.000.000 VND`.
- **Đệm khẩn cấp an toàn (`safeEmergencyBuffer`):** `25.000.000 VND`.
- **Hạn mức vay đòn bẩy (`borrowingLimit`):** `120.000.000 VND`.
- **Quy mô biến cố cá nhân (`eventScaleMultiplier`):** `2.2x`.

---

## 2. THỬ THÁCH ĐỈNH CAO: ĐÒN BẨY ĐẦU TƯ & CƯỠNG CHẾ CALL MARGIN

1. **Công Thức Tỷ Lệ Đòn Bẩy (`leverageRatio`):**
   $$\text{Leverage Ratio} = \frac{\text{Nợ vay hiện tại (Debt)}}{\text{Tiền mặt} + \text{Gốc tiết kiệm hoạt động} + \text{Giá bán ròng Cổ phiếu, Trái phiếu, Vàng}}$$
   *(Lưu ý: Tiệm kinh doanh không được tính vào tài sản đảm bảo thanh khoản vì không thể thanh lý tức thời).*
2. **Ngưỡng Kích Hoạt Call Margin (`marginCallThreshold = 0.60`):**
   - Mỗi khi thị trường biến động tại ô `Biến động vĩ mô` hoặc đầu kỳ quyết toán `START`, nếu $\text{Leverage Ratio} > 60\%$, hệ thống lập tức kích hoạt **`Lệnh Call Margin Cưỡng Chế` (`evaluateAndExecuteMarginCall`)**.
   - Hệ thống tự động bán cưỡng bức Cổ phiếu và Vàng đang nắm giữ (chịu thêm **phí phạt thanh lý cưỡng bức `5%`** trên giá trị bán ròng) để trả bớt nợ, đưa tỷ lệ đòn bẩy về mức an toàn **`45%` (`marginTargetRatio`)**.
3. **Bài Học Chiến Lược:**
   - Người chơi không thể vay kịch trần 120M để "all-in" Cổ phiếu hoặc mở Tiệm kinh doanh (làm giảm tài sản đảm bảo thanh khoản) mà phải duy trì tỷ lệ đòn bẩy dưới `45%` và phòng vệ bằng Vàng/Tiết kiệm trước các cú sốc vĩ mô.
