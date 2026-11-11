# GIAO DIỆN 3D HÓA TỪNG CHƯƠNG – "Hành Trình Của Minh"

> **Dự án:** PlayBoard (Hệ sinh thái Giáo dục Tài chính 2026)  
> **Cập nhật:** 11/11/2026 · Đi kèm `SYSTEM_ARCHITECTURE.md`, `AGENTS_SOP.md`, `docs/chapters/`  
> **Ý tưởng cốt lõi:** Mỗi chương là một **diorama 3D** của cùng một thành phố sông nước – cùng bàn cờ B18, nhưng thế giới xung quanh, ánh sáng, vật thể ẩn dụ và nhịp điện ảnh đổi theo chủ đề tài chính của chương.

---

## 1. Chiến Lược 3D: "2.5D Lai", Không Dựng Lại Cả Bàn Cờ

Hiện trạng: bàn cờ là ảnh isometric (`playboard-4.PNG`), mascot 3D (`Character3D`), xúc xắc 3D (`Dice3D`). Dựng lại toàn bộ bàn cờ thành 3D thật rất tốn art và dễ lệch tọa độ 18 ô. Đề xuất 3 mức:

| Mức | Nội dung | Chi phí | Khuyến nghị |
|---|---|---|---|
| **L1 – 2.5D lai** | Giữ bàn cờ ảnh isometric; thêm **lớp 3D phía trên/xung quanh**: mascot, xúc xắc, vật thể ẩn dụ (low-poly), hạt, ánh sáng, parallax | Thấp–vừa | ✅ **Làm trước (Hoàn thiện hiện tại)** |
| **L2 – Diorama low-poly** | Thay phần nền xung quanh bàn cờ bằng cảnh 3D low-poly theo chương (tòa nhà, đường, cây); bàn cờ vẫn là ảnh | Vừa–cao | ✅ Giai đoạn 2 |
| **L3 – Bàn cờ 3D thật** | Ô cờ là mesh, quân cờ đi trên mesh | Cao, rủi ro lệch | ❌ Không đề xuất |

**Quy tắc:** *HUD, nút bấm, modal giao dịch luôn là DOM* (dễ đọc, dễ chạm $\ge 48\text{ dp}$, trợ năng). 3D chỉ dành cho **thế giới** và vài **"vật thể chữ ký"** của từng chương.

---

## 2. Nguyên Tắc "Vật Thể Ẩn Dụ Gắn State Engine"

Mỗi vật thể 3D **đọc trực tiếp từ state** qua module `stateBindings.ts` (không có số liệu riêng), nên đẹp mà vẫn đúng logic:

| State engine | Vật thể 3D | Hành vi |
|---|---|---|
| **Tiền mặt** | **Chồng xu** cạnh quân cờ | Cao/thấp theo số dư; tụt xuống khi chi tiêu |
| **Nợ vay** | **Dây xích** nối vào chân quân cờ | Số mắt xích ∝ % vay/tài sản; chuyển đỏ khi gần hạn mức 30M |
| **Tiến độ 90M** | **Lá cờ đích** trên đường chân trời | Lá cờ "lại gần" và tỏa hào quang khi tiến độ tăng |
| **Vòng chơi (1–4)** | **Ánh sáng/mùa trong ngày** | Sáng sớm (Q1) $\rightarrow$ Trưa (Q2) $\rightarrow$ Chiều tà (Q3) $\rightarrow$ Đêm về đích (Q4) |
| **Cơ sở kinh doanh (cấp nâng)** | **Công trình lớn dần** (xe đẩy $\rightarrow$ quán $\rightarrow$ quán có mái) | Hoạt ảnh "mọc lên" khi mua/nâng |
| **Giá cổ phiếu 6 mã** | **6 tòa tháp** | Chiều cao tháp ∝ giá, đổi màu xanh/đỏ |
| **Danh mục** | **Radar hologram** | Hình đa giác ∝ tỷ trọng, cảnh báo khi lệch |
| **Tiết kiệm có kỳ hạn** | **Két sắt + số ổ khóa = số vòng** | Mở ổ khi đáo hạn |
| **Rủi ro tín dụng (Bứt Phá)** | **Hộp hồ sơ nứt dần** | Nứt khi sự kiện rủi ro xảy ra |

---

## 3. Kiến Trúc Kỹ Thuật Module `mobile_app/src/features/stage3d/`

```
mobile_app/src/features/stage3d/
  ChapterStage.tsx         # Một canvas Three.js bán trong suốt dùng chung, nhận theme theo chương
  types.ts                 # Interface VisualMetaphors, ChapterTheme, Stage3DProps
  bindings/
    stateBindings.ts       # Map state engine GameState -> VisualMetaphors
  props/                   # Các vật thể: CoinStack, DebtChain, GoalFlag, Cafe, Vault, Tower...
  fx/                      # LightingRig, ParticleSystem (mưa, hơi cafe, bụi sáng, pháo hoa)
  fallback/                # Chế độ nhẹ tự động khi FPS < 45
```

### Ngân Sách Hiệu Năng (Performance Budget 60 FPS)

| Hạng mục | Mục tiêu |
|---|---|
| **FPS** | 60 trên máy tầm trung, tối thiểu 45 trên máy yếu (tự giảm chất lượng) |
| **Số tam giác cả cảnh** | $\le 60.000$ |
| **Draw calls** | $\le 100$ |
| **Mỗi prop** | $\le 3.000$ tam giác; texture atlas $\le 1024^2$ |
| **Bộ nhớ GPU** | Bắt buộc `dispose()` toàn bộ geometry, material, texture khi unmount |
| **Tọa độ** | Khớp 1:1 với canvas 940 × 1672 px của bàn cờ B18 |
