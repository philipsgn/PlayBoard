# PLAYBOARD: MASTER SYSTEM ARCHITECTURE DOCUMENT (SAD)
## Kiến Trúc Hệ Thống Tổng Thể Toàn Diện Cho Game Bàn Cờ Tỷ Phú Đầu Tư Tài Chính 3 Chương
**Kiến trúc sư trưởng:** Phát (Owner & Lead Game Developer)  
**Dự án:** PlayBoard (`https://github.com/philipsgn/PlayBoard.git`)  
**Tiêu chuẩn:** Mobile-First Canvas 1080 × 2400 px · 2.5D Hybrid Isometric Diorama (Three.js) + React 19 · TypeScript  

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (SYSTEM OVERVIEW)

PlayBoard là ứng dụng game bàn cờ tỷ phú giáo dục đầu tư tài chính đa cấp độ trên nền tảng Mobile Web / PWA. Ứng dụng kết hợp giữa cỗ máy mô phỏng toán kinh tế tất định (Deterministic Seed RNG, 100% số nguyên VND) và trải nghiệm thị giác **2.5D Hybrid Isometric Diorama + Tactile Financial UI**.

### 1.1. Sơ Đồ Khối Kiến Trúc Phân Tầng (Layered Architecture)

```mermaid
flowchart TD
    subgraph UI_Layer["1. LỚP GIAO DIỆN & ĐỒ HỌA 2.5D (PRESENTATION LAYER)"]
        Stage3D["Stage3D Diorama (Three.js Overlay)<br/>• Chồng xu tiền mặt 3D (CoinStackProp)<br/>• Xích nợ cảnh báo 3D (DebtChainProp)<br/>• Cờ đích 90M/180M/360M (GoalFlagProp)<br/>• Ánh sáng 4 Vòng & 3 Chương (LightingRig)"]
        Board25D["Isometric 2.5D Board & 3D Pawns<br/>• Mặt bàn cờ B18 (940 × 1672 px)<br/>• Nhân vật 3D (Character3D) & Xúc xắc 3D (Dice3D)"]
        ReactUI["Tactile Financial UI (React 19)<br/>• Bản đồ 3 Đảo Chương (MapScreen)<br/>• Thẻ quyết định Holographic & Biểu đồ giá<br/>• Cảnh báo Đệm khẩn cấp & Call Margin<br/>• AI Coach phân tích sau ván"]
    end

    subgraph Coordination_Layer["2. LỚP ĐIỀU PHỐI TRUNG TÂM (ORCHESTRATION LAYER)"]
        MSM["MasterSessionManager (src/game/master-session.ts)<br/>• Hồ sơ người chơi (MasterPlayerProfile)<br/>• Mở khóa tuần tự Chương 1 -> Chương 2 -> Chương 3<br/>• Chuyển giao vốn có trần (Capped Carryover +15M / +30M)"]
    end

    subgraph Engine_Layer["3. LỚP CỖ MÁY TÍNH TOÁN TÀI CHÍNH (CORE BOARD ENGINE)"]
        Presets["Chapter Presets (src/data/chapter-presets.ts)<br/>• Ch1: 50M -> 90M (4 Vòng, Đệm 10M)<br/>• Ch2: 90M+ -> 180M (4 Vòng, Lạm phát +1M, Hệ quả trễ)<br/>• Ch3: 180M+ -> 360M (5 Vòng, Đòn bẩy 120M & Call Margin 60%)"]
        CoreEngine["B18 Financial Engine (src/game/engine.ts & settlement.ts)<br/>• 5 Kênh tài sản: Tiết kiệm, Cổ phiếu, Trái phiếu V2.5, Vàng, Kinh doanh<br/>• Bẫy thanh khoản (pendingPayment / fundPayment)<br/>• Hệ quả trễ & Thanh lý cưỡng bức Call Margin"]
    end

    subgraph Infrastructure_Layer["4. LỚP DỊCH VỤ DÙNG CHUNG (INFRASTRUCTURE & SERVICES)"]
        Storage["LocalStorage Persistence (saved-game.ts & master-session.ts)"]
        Audio["Web Audio API Synthesizer & Haptics (audio.ts)"]
        RNGCore["Deterministic Seed-based RNG (random.ts)"]
    end

    UI_Layer --> Coordination_Layer
    Coordination_Layer --> Engine_Layer
    Engine_Layer --> Infrastructure_Layer
    UI_Layer --> Infrastructure_Layer
```

---

## 2. LỚP ĐIỀU PHỐI TRUNG TÂM (`MasterSessionManager`)

`MasterSessionManager` (`src/game/master-session.ts`) quản lý tiến trình xuyên suốt 3 Chương Bàn Cờ mà vẫn giữ tính cân bằng toán học thông qua cơ chế **Capped Carryover**:

```mermaid
sequenceDiagram
    autonumber
    actor Player as Người Chơi
    participant Ch1 as Chương 1 (50M -> 90M)
    participant MSM as MasterSessionManager
    participant Ch2 as Chương 2 (90M+ -> 180M)
    participant Ch3 as Chương 3 (180M+ -> 360M)

    Player->>Ch1: Hoàn thành 4 Vòng B18
    Ch1->>Ch1: Kết toán Nguồn Huy Động Hợp Lệ = 112.000.000 VND (≥ 90M)
    Ch1->>MSM: recordBoardChapterVictory(profile, 1, 112M)
    MSM->>MSM: Mở khóa Chương 2 + Capped Carryover = Min(15M, 112M - 90M) = +15M
    Player->>Ch2: Bắt đầu Chương 2 với Vốn khởi điểm = 90M + 15M = 105.000.000 VND
    Player->>Ch2: Vượt lạm phát & hệ quả trễ sau 4 Vòng, đạt 205.000.000 VND (≥ 180M)
    Ch2->>MSM: recordBoardChapterVictory(profile, 2, 205M)
    MSM->>MSM: Mở khóa Chương 3 + Capped Carryover = Min(30M, 205M - 180M) = +25M
    Player->>Ch3: Bắt đầu Chương 3 với Vốn khởi điểm = 180M + 25M = 205.000.000 VND
    Player->>Ch3: Vượt 5 Vòng chu kỳ & phòng vệ Call Margin, đạt ≥ 360.000.000 VND
```

---

## 3. PIPELINE ĐỒ HỌA 2.5D HYBRID DIORAMA (`ChapterStage`)

1. **Tách biệt hoàn toàn khỏi Logic Engine:** `extractVisualMetaphors(game)` (`mobile_app/src/features/stage3d/bindings/stateBindings.ts`) là một pure adapter đọc `GameState` và xuất ra chiều cao chồng xu, số mắt xích nợ, tỷ lệ tiến độ cờ đích và thời gian ánh sáng trong ngày.
2. **Giải phóng bộ nhớ WebGL bắt buộc:** Khi rời bàn cờ, `ChapterStage.tsx` hủy `requestAnimationFrame` và gọi `.dispose()` trên toàn bộ Prop (`CoinStackProp`, `DebtChainProp`, `GoalFlagProp`, `LightingRig`), Geometry, Material và `renderer.forceContextLoss()`.

---

## 4. BẢO MẬT & KIỂM SOÁT TÍNH TOÀN VẸN DỮ LIỆU

1. **Chống Sai Số Số Thực (Zero Floating-Point Drift):** Toàn bộ phép tính giá cổ phiếu, phí giao dịch, spread vàng, lãi tiết kiệm, coupon trái phiếu và phạt Call Margin đều làm tròn về số nguyên VND (`Math.round()`).
2. **Deterministic Seed-based Replay:** Cùng một chuỗi hạt giống (`seed`) và chuỗi quyết định của người chơi sẽ luôn tái hiện chính xác 100% lịch sử giá và kết quả ván cờ.
