# PlayBoard Core UI Design System (Dùng chung Chương 1 & Chương 2)

Tài liệu này xác lập hệ thống quy chuẩn thiết kế giao diện thống nhất cho toàn bộ hệ sinh thái game **PlayBoard** (Chương 1: Cờ Tỷ Phú Tài Chính & Chương 2: Khởi Nghiệp Chủ Quán Cà Phê).

---

## 1. Nguyên Tắc Thiết Kế Cốt Lõi (Core Principles)

1. **Mobile-First Canvas:**
   - Kích thước chuẩn: **1080 × 2400 px**, tỷ lệ màn hình dài **9:20 / 20:9**.
   - Công thái học một ngón tay cái (One-thumb Ergonomics): Các nút hành động chính, gieo xúc xắc, chọn thẻ quyết định đều nằm ở 45% phía dưới màn hình.
2. **Ngôn Ngữ Thẩm Mỹ:**
   - **Playful Gamification + Lively Fantasy + Tactile 3D Feedback.**
   - Mọi nút bấm đều có hiệu ứng nhấn lún (tactile active scale: `0.96`), bóng đổ mềm đổ dốc theo góc sáng top-left, và đường viền bảo vệ tương phản cao.
3. **Typography Tiếng Việt:**
   - Phông chữ độc quyền: **Fredoka** (Medium, SemiBold, Bold, ExtraBold).
   - Con số tài chính: Luôn dùng `fontVariantNumeric: 'tabular-nums'` và phân cách hàng nghìn bằng dấu chấm (`10.000.000 đ`).

---

## 2. Bảng Màu Nhận Diện & Design Tokens

### A. Màu Sắc Danh Mục Tài Sản (Chương 1 & Chương 2)
| Kênh / Phân hệ | Màu Chủ Đạo | Gradient Thẻ Bài | Ý nghĩa cảm xúc |
|---|---|---|---|
| **Tiền mặt / Vàng** | `#D97706` (Amber Gold) | `linear-gradient(180deg, #FEF3C7, #FDE68A)` | Sung túc, an toàn, thanh khoản cao |
| **Gửi Ngân hàng** | `#059669` (Emerald Mint) | `linear-gradient(180deg, #ECFDF5, #D1FAE5)` | Tích lũy bền vững, lãi suất an toàn |
| **Cổ phiếu** | `#2563EB` (Royal Blue) | `linear-gradient(180deg, #EFF6FF, #DBEAFE)` | Tăng trưởng, cơ hội, biến động thị trường |
| **Trái phiếu** | `#7E22CE` (Imperial Violet) | `linear-gradient(180deg, #FAF5FF, #F3E8FF)` | Cam kết hợp đồng, xếp hạng tín dụng |
| **Quán Cà Phê F&B** | `#92400E` (Roasted Coffee / Caramel) | `linear-gradient(180deg, #FFFBEB, #FEF3C7)` | Hương vị ấm áp, khởi nghiệp thực tế |
| **Nợ / Rủi ro** | `#DC2626` (Ruby Crimson) | `linear-gradient(180deg, #FEF2F2, #FEE2E2)` | Cảnh báo dòng tiền, áp lực thanh toán |

---

## 3. Hệ Thống Nút Bấm 4 Cấp (Button Hierarchy)

1. **Primary CTA (Hành động Vàng):**
   - Background: `linear-gradient(180deg, #FCD34D 0%, #F59E0B 45%, #D97706 100%)`.
   - Viền: `2px solid #FEF3C7`.
   - Shadow: `0 4px 14px rgba(245, 158, 11, 0.45), 0 2px 4px rgba(0,0,0,0.2)`.
   - Dùng cho: Bắt đầu ván, Gieo xúc xắc, Xác nhận mua/gửi tiền, Chốt ca bán cà phê.

2. **Success CTA (Hành động Xanh):**
   - Background: `linear-gradient(180deg, #34D399 0%, #059669 100%)`.
   - Viền: `2px solid #D1FAE5`.
   - Dùng cho: Nâng cấp quán, Thu hồi vốn, Đạt điểm hòa vốn.

3. **Secondary / Neutral CTA:**
   - Background: `#FFFFFF`.
   - Viền: `1.5px solid #CBD5E1`.
   - Dùng cho: Xem lịch sử, Đóng modal, Trở về bàn chơi.

4. **Ghost / Skip CTA:**
   - Background: `transparent`.
   - Border: `none`.
   - Text: `#78350F` (SemiBold / Bold).
   - Dùng cho: Bỏ qua cơ hội này $\rightarrow$.

---

## 4. Hệ Thống Khung Modal & 9-Slice Card

- **Bo góc chuẩn:**
  - Chip / Badge: `border-radius: 999px` (viên thuốc hoàn hảo).
  - Thẻ con (Item Card): `border-radius: 14px - 16px`.
  - Khung bao ngoài (Modal Sheet): `border-radius: 24px - 28px`.
- **An toàn ký hiệu tiền tệ:** Ký hiệu `đ` luôn đặt trong container có `position: relative`, bọc `span` tuyệt đối cách lề phải 12px, đảm bảo không bao giờ bị tràn khung trên mọi kích cỡ màn hình.

---

## 5. Quy Trình 7 Bước Triển Khai Màn Hình Mới
Khi thiết kế bất kỳ màn hình nào (đặc biệt là Chương 2 Quán Cà Phê):
1. **Product Design:** Viết GDD/PRD tại `specs/playboard/prd.md`.
2. **UI Specification:** Kiểm tra tokens trong `specs/playboard/contracts/style-contract.yaml`.
3. **Screen Layout:** Phác thảo bố cục màn hình tại `specs/playboard/contracts/screen-contract.yaml`.
4. **Component Breakdown:** Lập danh mục components độc lập.
5. **Sprite Splitter:** Cắt xuất các icon và nút bấm ra transparent PNG.
6. **Asset Pipeline:** Lưu trữ chuẩn hóa vào `public/assets/` với độ phân giải x2, x3.
7. **Verification:** Chạy `npm run ui:validate` để xác thực toàn vẹn.
