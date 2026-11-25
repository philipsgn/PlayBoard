# PlayBoard UI & 2.5D Diorama Rules (Antigravity & Coding Agents)

Bộ quy tắc định nghĩa tiêu chuẩn giao diện và đồ họa dành cho Agent khi làm việc cùng **Phát (Owner & Lead Game Developer / Kiến Trúc Sư Trưởng)** trong dự án **PlayBoard**.

---

## 1. Định Hướng Thẩm Mỹ & Kiến Trúc Hiển Thị

1. **Lõi Sản Phẩm Duy Nhất — Cờ Tỷ Phú Đầu Tư Tài Chính 3 Chương:**
   - Bản đồ Hành trình (`MapScreen.tsx`) hiển thị **3 Đảo Chương Bàn Cờ Lớn**:
     - **Chương 1:** Khởi Đầu Tích Lũy (`50M → 90M VND · 4 Vòng · Đệm 10M`)
     - **Chương 2:** Đòn Bẩy Tăng Trưởng (`90M+ → 180M VND · 4 Vòng · Hệ Quả Trễ`)
     - **Chương 3:** Bão Vĩ Mô & Tự Do Tài Chính (`180M+ → 360M VND · 5 Vòng · Call Margin`)
   - Tuyệt đối không đưa lại bất kỳ màn hình hay component quản lý pha cà phê nào vào ứng dụng.
2. **Tiêu Chuẩn Mobile-First & Typography:**
   - Khung hiển thị chuẩn `1080 × 2400 px` (Board viewport `940 × 1672 px`), tối ưu thao tác một ngón tay cái.
   - Phông chữ duy nhất: **Fredoka** hỗ trợ 100% tiếng Việt có dấu.
3. **Đồ Họa 2.5D Hybrid Isometric Diorama (`BoardView` + `ChapterStage`):**
   - Mặt bàn cờ Isometric 2.5D kết hợp Nhân vật 3D (`Character3D.tsx`), Xúc xắc 3D (`Dice3D.tsx`) và lớp Diorama 3D bán trong suốt (`ChapterStage.tsx` với `CoinStackProp`, `DebtChainProp`, `GoalFlagProp`, `LightingRig`).
   - Khóa cứng 60 FPS trên mobile (`pixelRatio <= 1.5`), bắt buộc gọi `.dispose()` và `renderer.forceContextLoss()` khi unmount.

---

## 2. Cổng Kiểm Thử Bắt Buộc Trước Mọi Commit

```sh
npm test                                                                        # Toàn bộ Unit tests engine (100% PASS)
node --experimental-strip-types --test scripts/diagnostics/mobile-final-ui.test.ts # 8 Tests hợp đồng UI Mobile (100% PASS)
npm run build                                                                   # Build web bundle thành công
npm --prefix mobile_app run build                                               # Build mobile app bundle thành công
```
