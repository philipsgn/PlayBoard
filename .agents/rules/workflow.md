# WORKFLOW, ATOMIC SCOPE ISOLATION & GEMINI 4 MODEL ROUTING RULES
**Dành cho:** AI Coding Agents & Subagents  
**Dự án:** *PlayBoard* — Game Bàn Cờ Tỷ Phú Tích Hợp Đầu Tư Tài Chính 3 Chương  
**Nguyên tắc tối thượng:** "Đọc Tài Liệu Trước — Chọn Đúng Model — Thiết Kế Đơn Phạm Vi — Kiểm Tra Toàn Diện"  

---

## 1. MA TRẬN CHỌN MODEL (GEMINI 4 SERIES)

1. **Lập Kế Hoạch (`/plan`, `/grill-me`) & Điều Phối Đa Nhánh (`run_workflow`):**
   - Chọn **`Orchestrator (Neon)`** hoặc **`Orchestrator (Carbon)`** trên UI Antigravity.
2. **Suy Luận Toán Tài Chính, Luật Cờ Tỷ Phú, Call Margin, Hệ Quả Trễ (`src/game/**`):**
   - Chọn **`Gemini 4 Neon (Medium)`** hoặc **`Gemini 4 Carbon (Medium)`** (Subagent tier: `model: "pro"` hoặc `"inherit"`).
3. **Thực Thi Giao Diện React/CSS, Dọn Dẹp Code & Viết Unit Tests (`mobile_app/**`, `tests/**`):**
   - Chọn **`Gemini 4 Hydrogen (Medium)`** (Subagent tier: `model: "flash"` hoặc `"inherit"`).
4. **Kiểm Tra Nhanh, Quét Chính Tả Tiếng Việt & Chạy Build Gate:**
   - Chọn **`Gemini 4 Hydrogen (Medium)`** (Subagent tier: `model: "flash_lite"` hoặc `"flash"`).

---

## 2. QUY TRÌNH PHÁT TRIỂN 5 BƯỚC BẮT BUỘC (5-STEP EXECUTION WORKFLOW)

```
[BƯỚC 1: ĐỌC TÀI LIỆU] ──► [BƯỚC 2: KHOANH VÙNG PHẠM VI] ──► [BƯỚC 3: TRIỂN KHAI CODE]
                                                                         │
[BƯỚC 5: NGHIỆM THU PHẠM VI] ◄── [BƯỚC 4: CHẠY CỔNG KIỂM THỬ] ◄────────┘
```

### BƯỚC 1: ĐỌC TÀI LIỆU ĐẶC TẢ TƯƠNG ỨNG
Đọc `AGENTS.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/AGENTS_SOP.md` và tài liệu chương tương ứng tại `docs/chapters/`.

### BƯỚC 2: KHOANH VÙNG PHẠM VI (SCOPE ISOLATION)
Mỗi task chỉ tập trung vào đúng một module hoặc một nhóm component liên quan trực tiếp (`Engine`, `Stage3D`, `Mobile UI`, hoặc `Tests`).

### BƯỚC 3: TRIỂN KHAI CODE CHUẨN MỰC
- **Engine (`src/game/**`):** Thuần TypeScript, số nguyên VND, Deterministic RNG.
- **UI (`mobile_app/src/components/**`):** Font `Fredoka` tiếng Việt 100%, chuẩn `1080 × 2400 px`.
- **Stage3D (`mobile_app/src/features/stage3d/**`):** 60 FPS, giải phóng WebGL sạch sẽ khi unmount.

### BƯỚC 4: VƯỢT QUA CỔNG KIỂM THỬ TỰ ĐỘNG (QUALITY GATEWAY)
```powershell
npm test
node --experimental-strip-types --test scripts/diagnostics/mobile-final-ui.test.ts
npm run build
npm --prefix mobile_app run build
```

### BƯỚC 5: XÁC MINH GIT STATUS
Chạy `git status` để xác nhận không có file rác hoặc file ngoài phạm vi bị sửa đổi vô ý.
