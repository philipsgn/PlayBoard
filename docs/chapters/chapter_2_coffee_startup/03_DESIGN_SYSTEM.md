# CHƯƠNG 2: KHỞI NGHIỆP QUÁN CÀ PHÊ (COFFEE SHOP SIMULATOR)
## HỆ THỐNG THIẾT KẾ MỸ THUẬT & GIAO DIỆN (DESIGN SYSTEM)
**Aesthetic Theme:** Artisan Coffeehouse & Cozy Shop Tycoon  
**Tiêu chuẩn:** Mobile-First Canvas 1080 × 2400 px (Tỷ lệ 9:20 / 20:9)  
**Typography:** Fredoka (Medium 500, SemiBold 600, Bold 700) 100% tiếng Việt  
**Phiên bản:** 2.0 (Chuẩn Vận Hành F&B Thực Tế & Cozy Tycoon 2026)  
**Tác giả:** Senior Game Manager Creator 2026  

---

## 1. PHONG CÁCH NGHỆ THUẬT (VISUAL IDENTITY)
Chương 2 hòa quyện giữa **Artisan Coffeehouse hoài cổ** với **ngôn ngữ Cozy Shop Tycoon vui nhộn, gây nghiện**:
- Cảm giác ấm áp mùi hạt cà phê rang mộc, ánh đèn vàng ấm cúng, bề mặt gỗ thông mộc mạc.
- **Phản hồi xúc giác phong phú (Juicy Feedback):** Khách hàng Chibi nhấp nhô biểu cảm, tách cà phê bốc khói mờ ảo, hũ tiền tip leng keng nảy số, và các hạt tiền bay bổng khi ra quyết định.
- **Tối giản công thái học một ngón tay cái:** Các nút bấm tactile to bản, nhãn tài chính minh bạch, không gây rối mắt.

---

## 2. BẢNG MÀU CHỦ ĐẠO (COZY COFFEE PALETTE)

| Token Name | Hex Code | Tên màu tiếng Việt | Ứng dụng giao diện |
| :--- | :---: | :--- | :--- |
| `coffee-espresso-900` | `#1E130C` | Đen Cà Phê Espresso | Nền thanh trạng thái, nền tối toàn màn hình |
| `coffee-roast-800` | `#451A03` | Nâu Hạt Cafe Rang Đậm | Thanh điều hướng, khung bảng P&L, nền quầy bar |
| `coffee-caramel-700`| `#78350F` | Nâu Caramel Ấm | Nút bấm tactile, mặt bàn quầy bar, viền gỗ kẹp bill |
| `coffee-amber-500` | `#D97706` | Hổ Phách Mật Ong | Điểm nhấn nổi bật, viền thẻ Polaroid, kim áp suất |
| `coffee-latte-100` | `#FEF3C7` | Bọt Sữa Latte Dịu Nhẹ| Giấy in hóa đơn nhiệt P&L, nền bong bóng lời thoại |
| `coffee-cream-50` | `#FFFBEB` | Kem Tươi Thanh Trùng | Viền thẻ Polaroid vintage, nhãn bài học takeaway |
| `finance-profit-500` | `#10B981` | Xanh Ngọc Lợi Nhuận | Badge Tiền mặt, vùng hoàn hảo 9 bar, lãi ròng dương |
| `finance-loss-500` | `#EF4444` | Đỏ Báo Động / Lỗ | Cảnh báo cạn tiền Runway, còi báo động khủng hoảng |

---

## 3. CÁC THÀNH PHẦN GIAO DIỆN CỐT LÕI (CORE UI COMPONENTS)

### 3.1. Quầy Bar Hoạt Họa & Khách Hàng Chibi (`ChibiCustomerBar.tsx`)
- **Quầy Bar Gỗ Mộc:** Chiều cao 110px, mô phỏng mặt bàn quầy bar với máy pha cà phê mini 2 group và tách cà phê sứ.
- **Làn khói cà phê (`.coffee-steam-vapor`):** Sử dụng `@keyframes coffeeSteamFlow` tạo hiệu ứng khói mờ ảo uốn lượn liên tục trên tách cà phê.
- **Khách hàng Chibi vector (`.cozy-chibi-bounce`):** 
  - Khách hàng nhấp nhô vui vẻ theo chu kỳ 1.8s.
  - Bong bóng trên đầu hiển thị món nước yêu thích (Bạc xỉu, Cold brew, Matcha latte, Croissant) tự động thay đổi sau mỗi 8s.
  - 4 biểu cảm động: Bình thường, Thả tim sung sướng (`.heart-float-anim`), Lo lắng toát mồ hôi khi khủng hoảng, và Khách thưởng tiền tip.
- **Hũ tiền Tip leng keng (`.tip-jar-jingle`):** Hũ thủy tinh chứa tiền xu vàng; khi chạm vào phát âm thanh leng keng và nảy số tip.

### 3.2. Top HUD Kẹo Ngọt Tối Giản (Chubby Candy Badges)
- 4 huy hiệu bo tròn 999px phong cách kẹo ngọt, viền nổi 3D:
  - 💵 **TIỀN MẶT:** Nền gradient xanh ngọc/đỏ thẫm khi nguy cấp.
  - ☕ **LY/NGÀY:** Nền xanh biển sẫm viền xanh da trời.
  - ⭐ **HÀI LÒNG:** Nền nâu hổ phách viền vàng nắng.
  - 🛡️ **RUNWAY:** Nền cam cháy caramel viền cam sáng (nhấp nháy nhịp tim khi $< 1.5$ tháng).

### 3.3. Thẻ Quyết Định Polaroid 3D Tilt (`CoffeeDecisionCard.tsx`)
- Thẻ ảnh Polaroid vintage với viền trắng kem, xoay nhẹ ngẫu nhiên $\pm 2^\circ$.
- 3 khối nút bấm tactile A/B/C với tag tài chính minh bạch: Capex (Đỏ/Xanh), Ly/ngày (Xanh da trời), Định phí (Vàng).
- Popup bài học giáo dục thực chiến (Educational Takeaway) xuất hiện sau khi chọn.

### 3.4. Bảng Kẹp Bill Gỗ P&L In Hóa Đơn Từng Dòng (`CoffeeReceiptModal.tsx`)
- Bảng kẹp bill gỗ retro với vân gỗ sồi tự nhiên và kẹp kim loại sáng bóng (100% CSS Vector).
- Giấy in hóa đơn trượt ra (`@keyframes receiptSlideDown`) với 8 dòng P&L lần lượt in ra kèm âm thanh in kim (`@keyframes receiptLinePrint`).
- Đáy hóa đơn có đường răng cưa xé giấy nhiệt chân thực.

### 3.5. Mini-Game Giờ Cao Điểm 8h (`BaristaRushMiniGame.tsx`)
- Màn hình 3 bước tương tác trực tiếp:
  - **Dosing Gauge:** Thanh gram hạt cà phê dâng lên khi giữ nút xả hạt (Vùng chuẩn 18.0 - 20.0g).
  - **Pressure Needle:** Kim đồng hồ dao động 0-15 bar (Vùng chuẩn 8.5 - 9.5 bar).
  - **Latte Art Pour:** Thanh đo độ mịn bọt sữa (Vùng chuẩn 75% - 95%).
- Tổng kết huy hiệu: 🌟 Perfect, 👍 Good, ☕ Pass.

---

## 4. HỆ THỐNG ÂM THANH PROCEDURAL WEB AUDIO (AUDIO TOKENS)

Không sử dụng file MP3/WAV tĩnh nặng nề, 100% âm thanh được tổng hợp thời gian thực bằng Web Audio API:
- `playEspressoMachine()`: Áp suất máy bơm 85Hz + tiếng xì hơi nước bandpass 1400Hz.
- `playReceiptPrint()`: 5 nhịp in kim cao tần 1900Hz - 2150Hz.
- `playCashDrawer()`: Hòa âm chuông kép 1350Hz & 1750Hz kèm rung haptic.
- `playGrinderSound()`: Tiếng xay hạt cà phê rào rào qua bộ lọc lowpass 600-1100Hz.
- `playSteamWand()`: Tiếng vòi sục bọt sữa béo ngậy bandpass 1800Hz.
- `playDingSuccess()`: Tiếng chuông quầy bar pha chế xong C7 2093Hz.
- `playCrisisAlarm()`: Còi báo động sóng răng cưa sawtooth 580-850Hz.
- `playTipJingle()`: Chuỗi 3 nốt nhạc đồng xu leng keng 1568Hz - 2093Hz - 2349Hz.
