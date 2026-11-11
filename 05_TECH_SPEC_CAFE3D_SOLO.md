# 05 – ĐẶC TẢ KỸ THUẬT: QUÁN CÀ PHÊ 3D "MỘT MÌNH" (CHƯƠNG 2)

> Cập nhật: 11/11/2026 · Tác giả: Phát · **Thay thế phạm vi** của `04_MASTERPROMPT_3D_WORLD_ACTIONS.md` (thành phố mở quá rộng). Giữ lại danh mục action và nguyên tắc "3D chỉ là lớp trình bày".
> Nguyên tắc mới: **làm MỘT cảnh thật tốt (quán cà phê) thay vì nhiều cảnh dở.**

---

## 1. Chẩn đoán từ 5 ảnh chụp (bản build hiện tại)

| # | Quan sát | Kết luận |
|---|---|---|
| 1, 3 | Camera nằm **sát/ngay sau lưng nhân vật**, cắt vào khối quầy nâu; nhân vật chiếm gần hết khung hình | Camera không có khung hình tối thiểu, không có xử lý va chạm/che khuất |
| 1, 3, 4 | Nhân vật đội **mũ bảo hiểm quân sự** (không phải barista Minh); đạo cụ là **hình hộp**; có **các đường xanh lạ** trên cao | Asset là placeholder, sai nhân vật, sai phong cách |
| 4 | **Cửa mở xoay 90° chạy được**, có dòng "Quán đã sẵn sàng đón khách!" | Cơ chế cửa đã có → giữ, nhưng cần dựng lại trong bối cảnh đúng |
| 1–4 | Panel **"ĐIỀU PHỐI HÀNH ĐỘNG 3D LIVE"** với nút bấm tay (Mở quán sáng / Reviewer A, B, C) | Đây là **bảng thử nghiệm**, không phải gameplay: hành động chưa được gọi từ luồng game |
| 5 | Chương 2 "Chủ quán cà phê": khung 3D **tối, rộng, trống**, hai nhân vật tí hon, đèn rọi; bên dưới là thẻ quyết định "Chiến lược chọn mặt bằng" | Cảnh không đọc được; không có nội thất, khách, quy trình làm việc |
| 2 | Bàn cờ 2D minh họa của Chương 1 **rất đẹp** (sông nước, phố, thuyền, chợ), nút **"THẾ GIỚI 3D LIVE"** nổi ở HUD | Phong cách đích: **sáng, rực rỡ, ấm**. Chương 1 nên giữ 2D thuần |

**Điều chỉnh đánh giá:** hệ thống đã có khung (cửa, nút bỏ qua, tốc độ ×1) nhưng **thiếu 4 thứ**: camera đúng, asset đúng, gắn vào luồng game, và mô phỏng "làm quán".

> **Lưu ý đánh số chương:** trong app hiện tại **Chương 1 = bàn cờ B18 (2D)** và **Chương 2 = "Chủ quán cà phê"**. `STORY_RPG.md` đang gọi quán cà phê là Chương 1. Đặc tả này **theo app hiện tại**; cần cập nhật STORY_RPG sau.

---

## 2. Quyết định engine / framework

| Lựa chọn | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **Three.js thuần (đang dùng)** | Đã có trong dự án, nhẹ, kiểm soát hoàn toàn, tách logic dễ test | Phải tự viết camera/animation controller | ✅ **CHỌN** |
| React Three Fiber (+ drei) | Viết cảnh kiểu khai báo, tích hợp React tiện | Thêm dependency; dễ re-render sai ở vòng lặp 60 FPS; khó tách logic thuần | ⚠️ Không bắt buộc; chỉ cân nhắc nếu được duyệt |
| Babylon.js | Có sẵn camera, animation group, nav | Bundle nặng hơn, phải học API mới, bỏ Three đang có | ❌ |
| **Unity WebGL** | Công cụ mạnh, editor trực quan | Build nặng (nhiều MB), nạp chậm, tốn RAM trên Safari mobile; **engine tài chính là TypeScript** nên phải viết lại hoặc bắc cầu JS–C#; khó nhúng giao diện React | ❌ Chỉ xét nếu sau này làm app native riêng và chấp nhận viết lại logic |
| PlayCanvas / Godot Web | Có editor | Pipeline riêng, tách khỏi React | ❌ |

**Quyết định:** **Three.js thuần**, bọc mỏng bằng một component React. Kiến trúc 3 lớp:

```
┌─ React (UI)        : Cafe3DViewport, ShiftHud, bottom sheet quyết định
├─ Engine (Three.js) : StageEngine, CameraRig, CharacterRig, DoorRig, NpcManager, Vfx
└─ Domain (TS thuần) : ShiftSim, Customer FSM, ActionPlan, Director, A*  ← KHÔNG import three, test được bằng Node
```

**Dependency:** chỉ dùng `three` (đã có) + các loader trong `three/examples/jsm` (`GLTFLoader`, `MeshoptDecoder` hoặc `DRACOLoader`, `SkeletonUtils`). **Không thêm gói mới** nếu chưa hỏi. Không cần thư viện vật lý (di chuyển kinematic) hay thư viện pathfinding (tự viết A* trên waypoint graph).

---

## 3. Những điều cần làm ngay theo yêu cầu

1. **Bỏ "Thế giới 3D" ở Chương 1:** xóa nút "THẾ GIỚI 3D LIVE", không mount scene, không nạp bundle 3D ở Chương 1 (dùng `import()` động, chỉ Chương 2 nạp). Bàn cờ 2D giữ nguyên.
2. **Bỏ panel "ĐIỀU PHỐI HÀNH ĐỘNG 3D LIVE" khỏi bản chạy thật:** chuyển thành công cụ debug (`?debug=3d`). Hành động phải do **sự kiện của game** gọi.
3. **Chương 2 mở đầu:** mở cửa quán → đi vào quán → làm việc một mình (đón khách, pha chế, phục vụ, thu tiền, dọn bàn).
4. **Bỏ cảnh hard-code:** mọi vị trí lấy từ file cấu hình (`venues/*.json`), không viết cứng trong component.

---

## 4. Bố cục màn hình Chương 2 (khớp ảnh số 5)

```
┌──────────────────────────────┐
│ HUD (giữ như hiện tại):       │  Mục tiêu tài sản · Tiền mặt · Ly/ngày · Hài lòng
├──────────────────────────────┤
│                              │
│   KHUNG 3D (Cafe3DViewport)  │  ~ 55–60% chiều cao; chạm = phóng to "Chế độ làm ca"
│                              │
├──────────────────────────────┤
│ Bottom sheet quyết định       │  Thẻ "Tháng 1 · Tình huống 1/4" (kéo xuống để thu gọn)
└──────────────────────────────┘
```

- **Chế độ nhúng:** khung 3D hiển thị quán, tự diễn (Minh làm việc, khách ra vào) khi người chơi đang đọc/chọn quyết định.
- **Chế độ làm ca (toàn màn hình):** chạm vào khung 3D hoặc nút **"Làm ca"**; HUD gọn lại, hiện nút hành động ngữ cảnh. Nút **"Thu nhỏ"** quay về nhúng (thay nút "Thu Nhỏ 3D" hiện tại).

---

## 5. Luồng Chương 2 (kịch bản trình diễn)

| Bước | Nội dung | Ghi chú |
|---|---|---|
| 0 | Vào chương: thẻ truyện 2D ngắn → chuyển sang khung 3D: **mặt bằng trống**, biển "Cho thuê", cửa đóng | Camera crane từ trên xuống |
| 1 | **Tình huống 1: chọn mặt bằng** (3 phương án có sẵn: Mặt tiền / Hẻm / Kiosk) | Mỗi phương án xem trước nhanh bằng ảnh |
| 2 | Nhận mặt bằng: hoạt ảnh **trả tiền cọc** (số tiền lấy từ engine) → nhận chìa khóa | `hand_over_money`, `take_key` |
| 3 | **Nghi thức mở quán lần đầu:** đi tới cửa → lấy chìa → mở khóa → đẩy cửa → lật biển **MỞ CỬA** → bước vào → bật đèn → kê ghế/lau bàn → bật máy pha | ~12–18 giây, **bỏ qua được** |
| 4 | **Ca hướng dẫn:** khách đầu tiên: chào → ghi order → pha chế → phục vụ → thu tiền (có chỉ dẫn) | Mỗi bước hiện gợi ý ngắn |
| 5 | **Ca làm tự do** (45–90 giây) hoặc **Tự động** (Minh tự làm) | Quyết định mặc định: xem mục 11 |
| 6 | Các tình huống tiếp theo (kể cả "Reviewer 1 sao") diễn **ngay trong quán** bằng ActionPlan | Dùng lại thiết kế A/B/C của `04_MASTERPROMPT…` |
| 7 | Cuối tháng: **nghi thức đóng quán** (lật biển ĐÓNG CỬA → đếm ly → đếm tiền → tắt đèn → khóa cửa) → cập nhật HUD | Có bản rút gọn |

**Biến thể địa điểm (dữ liệu, không code riêng):**

| Venue | Cảnh | Đặc trưng |
|---|---|---|
| `main_street` (Mặt tiền sầm uất) | Quán lớn, mặt kính, nhiều ghế, đông khách | Khách đến nhiều, kiên nhẫn trung bình |
| `alley` (Hẻm yên tĩnh có gu) | Quán nhỏ ấm cúng, nhiều cây | Khách ít, ngồi lâu, kiên nhẫn cao |
| `kiosk` (Kiosk vỉa hè đại học) | Quầy mở, không có ghế/cửa kéo (cửa cuốn) | Khách đi nhanh, mua mang đi, kiên nhẫn thấp |

Chủ đề hình ảnh bám bàn cờ 2D: **sáng, ấm, đậm chất sông nước Việt Nam** (gỗ, cây xanh, đèn dây, bảng phấn, nón lá), tên quán **hư cấu** (ví dụ "Cà Phê Bến Sương").

---

## 6. Cấu trúc thư mục

```
mobile_app/src/features/cafe3d/
  domain/                      # TS thuần – không import three
    types.ts
    shiftSim.ts                # mô phỏng ca làm việc (seeded)
    customerFsm.ts
    recipes.ts
    taskQueue.ts               # hàng đợi việc của Minh
    actionPlan.ts              # kiểu ActionPlan/Step
    director.ts                # ActionDirector: sự kiện game -> ActionPlan
    pathfinding.ts             # A* trên waypoint graph
    rng.ts                     # Mulberry32 (bản sao nhỏ, không import từ src/game)
  engine/                      # Three.js – không import React
    StageEngine.ts             # renderer, vòng lặp, resize, dispose, QualityManager
    AssetLoader.ts             # nạp/cache/giải phóng GLB
    CameraRig.ts               # khung hình, va chạm, cutaway
    CharacterRig.ts            # AnimationMixer, socket đạo cụ
    ActionRunner.ts            # chạy ActionPlan trên CharacterRig
    DoorRig.ts                 # cửa bản lề
    StationRig.ts              # máy pha, quầy, két
    NpcManager.ts              # khách (pool + instancing)
    Lighting.ts                # sáng/trưa/chiều/tối, tâm trạng
    Vfx.ts                     # hơi nước, tiền bay, emoji
    Cutaway.ts
  react/
    Cafe3DViewport.tsx
    ShiftHud.tsx               # nút hành động ngữ cảnh, hàng đợi, đồng hồ
    useCafeBridge.ts
  content/
    venues/main_street.json  alley.json  kiosk.json
    recipes.json  customers.json  actions.json  event_plans.json
public/assets/cafe3d/          # glb, texture (WebP/KTX2), ASSET_MANIFEST.md
```

---

## 7. Mã khung (skeleton) – agent phải bám theo

### 7.1 Kiểu dữ liệu & cầu nối với game (domain/types.ts)

```ts
export type VenueId = 'main_street' | 'alley' | 'kiosk'

/** Dữ liệu CHỈ ĐỌC lấy từ game Chương 2. Agent phải tìm nguồn thật (audit), không bịa. */
export interface CafeStateView {
  seed: string
  month: number
  situationIndex: number          // 1..4
  venue: VenueId | null
  cash: number
  cupsPerDay: number              // chỉ số "ly/ngày" trong HUD
  satisfaction: number            // 0..100, "% hài lòng"
  equipmentTier?: number
}

/** Sự kiện phát ra từ game để Director phản ứng. */
export type CafeEvent =
  | { type: 'chapterEntered' }
  | { type: 'venueChosen'; venue: VenueId; deposit: number }
  | { type: 'monthStarted'; month: number }
  | { type: 'situationShown'; id: string }
  | { type: 'optionChosen'; id: string; option: string; effects: Record<string, number> }
  | { type: 'monthEnded'; summary: Record<string, number> }

export interface Anchor {
  id: string
  pos: [number, number, number]   // mét; x phải, y lên, z về phía camera
  faceDeg: number                 // hướng nhìn quanh trục Y
  kind: 'stand' | 'station' | 'queue' | 'seat' | 'door' | 'spawn'
}

export interface WaypointGraph {
  nodes: { id: string; pos: [number, number, number] }[]
  edges: [string, string][]
}

export interface DoorSpec {
  id: string
  pivot: [number, number, number]
  closedDeg: number
  openDeg: number                 // ví dụ 90 (xoay vào trong)
  signId?: string                 // biển MỞ/ĐÓNG
  lockable: boolean
}

export interface VenueConfig {
  id: VenueId
  model: string                   // đường dẫn GLB
  hasInterior: boolean
  anchors: Anchor[]
  graph: WaypointGraph
  doors: DoorSpec[]
  stations: { id: string; anchorId: string; kind: 'espresso' | 'grinder' | 'register' | 'fridge' | 'sink' | 'iceBox' }[]
  seats: { id: string; anchorId: string }[]
  camera: Record<'exterior' | 'interior' | 'counter' | 'closeup', CameraPreset>
  lighting: Record<'morning' | 'noon' | 'evening' | 'night', LightingPreset>
}
export interface CameraPreset { offset: [number, number, number]; lookAtOffset: [number, number, number]; fovDeg: number; minDistance: number }
export interface LightingPreset { sky: string; ground: string; sunColor: string; sunIntensity: number; sunDir: [number, number, number]; exposure: number }
```

### 7.2 ActionPlan & ActionRunner

```ts
export interface AtomicAction {
  id: string                                  // vd 'unlock_door'
  clip: string | null                         // TÊN CLIP THẬT trong GLB, hoặc null nếu procedural
  durationSec?: number
  loop?: boolean
  needsAnchor?: Anchor['kind']
  attach?: { socket: 'handR' | 'handL' | 'head'; prop: string }[]
  detach?: string[]
  reducedMotion?: 'skip' | 'snap'
  sfx?: string
}

export interface Step {
  do: string                                  // id của AtomicAction
  at?: string                                 // anchorId hoặc interactableId
  wait?: number
  parallel?: Step[]
  vfx?: string
  bind?: 'cups' | 'satisfaction' | 'cash'     // hiển thị gắn state
}

export interface ActionPlan { id: string; steps: Step[]; maxSeconds: number; skippable: true; shortVariant?: string }

export class ActionRunner {
  constructor(private rig: CharacterRig, private world: WorldNav, private doors: Map<string, DoorRig>) {}
  skipRequested = false
  async run(plan: ActionPlan): Promise<void> {
    for (const step of plan.steps) {
      if (this.skipRequested) { this.snapToEnd(plan); return }
      if (step.at) await this.world.walkTo(this.rig, step.at)          // A* + quay đúng hướng
      await this.rig.play(step.do, step)                              // crossfade + socket
      if (step.wait) await sleep(step.wait * 1000)
    }
  }
}
```

### 7.3 Cửa bản lề (khớp với phần đã chạy trong ảnh 4)

```ts
export class DoorRig {
  state: 'locked' | 'closed' | 'opening' | 'open' | 'closing' = 'locked'
  constructor(readonly spec: DoorSpec, readonly pivotObj: THREE.Object3D) {}
  unlock() { if (this.state === 'locked') this.state = 'closed' }
  async open(ms = 700) {
    if (this.state !== 'closed') return
    this.state = 'opening'
    await tween(ms, easeInOutCubic, t => { this.pivotObj.rotation.y = THREE.MathUtils.degToRad(lerp(this.spec.closedDeg, this.spec.openDeg, t)) })
    this.state = 'open'
  }
  async close(ms = 600) { /* ngược lại, chuyển 'closing' → 'closed' */ }
}
```

### 7.4 Camera (nguyên nhân lỗi ở ảnh 1, 3 – bắt buộc làm đúng)

```ts
export class CameraRig {
  private current: CameraPreset
  occluders: THREE.Object3D[] = []            // mesh gắn userData.occluder = true
  update(dt: number, target: THREE.Vector3) {
    const p = this.current
    const desired = target.clone().add(new THREE.Vector3(...p.offset))
    const focus = target.clone().add(new THREE.Vector3(...p.lookAtOffset))

    // 1) Khoảng cách tối thiểu: KHÔNG BAO GIỜ gần hơn p.minDistance
    const dir = desired.clone().sub(focus)
    if (dir.length() < p.minDistance) desired.copy(focus).add(dir.setLength(p.minDistance))

    // 2) Che khuất: bắn tia focus -> desired; vật chắn là tường/trần thì làm mờ (cutaway), vật khác thì kéo camera lại gần focus (nhưng không dưới minDistance)
    const hits = raycast(focus, desired, this.occluders)
    for (const h of hits) h.object.userData.cutaway ? fade(h.object, 0.0) : pullCloser(desired, h)

    // 3) Mượt
    this.camera.position.lerp(desired, 1 - Math.exp(-6 * dt))
    this.camera.lookAt(focus)
  }
}
```

**Quy tắc khung hình bắt buộc (kiểm bằng ảnh chụp):**
- Nhân vật chiếm **tối đa ~35% chiều cao khung** ở preset `interior`, **~20%** ở `exterior`.
- Camera nằm **trên đầu nhân vật** (góc nhìn xuống 28–35°), FOV 35–42°, không nằm trong mesh nào.
- Chế độ trong nhà luôn **mở tường trước và trần** (dollhouse) để thấy toàn bộ quán và nhân vật.

### 7.5 Mô phỏng ca làm việc (domain/shiftSim.ts)

Hệ thống này làm cho "một mình vận hành quán" có **ý nghĩa gameplay**: *một người chỉ làm được một việc một lúc*, khách đợi lâu thì bực.

```ts
export interface Recipe { id: string; name: string; price: number; steps: { kind: 'grind'|'brew'|'steam'|'pour'|'ice'|'mix'|'garnish'; sec: number }[] }

export type CustomerState = 'approach' | 'queue' | 'ordering' | 'waiting' | 'served' | 'seated' | 'leaving' | 'angryLeaving'

export interface Customer {
  id: string; archetype: 'student' | 'office' | 'elder' | 'tourist' | 'reviewer'
  patience: number            // giây còn lại, giảm dần
  order?: string              // recipe id
  state: CustomerState
}

export interface ShiftConfig { cupsPerDay: number; shiftSeconds: number; shiftScale: number; venue: VenueId; seed: string }
export interface ShiftResult { served: number; walkedOut: number; avgWaitSec: number; mistakes: number; satisfactionDelta: number }

export class ShiftSim {
  constructor(cfg: ShiftConfig, recipes: Recipe[], rng: () => number) {}
  update(dt: number): SimEvent[]        // sinh khách theo cupsPerDay*shiftScale, giảm patience, xử lý FSM
  assign(task: Task): boolean           // người chơi giao việc cho Minh
  snapshot(): ShiftSnapshot
}
export type SimEvent =
  | { t: 'customerArrived'; id: string } | { t: 'orderTaken'; id: string }
  | { t: 'drinkReady'; id: string } | { t: 'served'; id: string } | { t: 'paid'; id: string; amount: number }
  | { t: 'customerLeft'; id: string; angry: boolean } | { t: 'shiftEnded'; result: ShiftResult }
```

- Hệ số (shiftScale, độ kiên nhẫn từng archetype, công thức satisfactionDelta) **nằm trong JSON**, không viết cứng.
- **Deterministic**: cùng seed + cùng hành động = cùng kết quả.
- `ShiftResult` **mặc định chỉ hiển thị** ("Hiệu suất ca") và ghi vào nhật ký. Việc cho nó tác động vào chỉ số game xem mục 11.

### 7.6 Cách người chơi điều khiển ("một nút ngữ cảnh", một tay)

Người chơi **giao việc**, Minh **tự đi và thao tác** (đúng yêu cầu "nhân vật thao tác như thật"):

| Việc có thể giao | Điều kiện hiển thị | Minh làm |
|---|---|---|
| Chào khách | Khách vừa vào, chưa chào | `greet_customer` |
| Ghi order | Khách đứng ở quầy | `take_order_notepad` |
| Pha món | Có order, máy rảnh | `grind_beans` → `tamp_coffee` → `pour_coffee`/`make_drink_shake` |
| Phục vụ | Món xong | `hand_cup_to_customer` / `serve_tray_to_table` |
| Thu tiền | Khách nhận món | `scan_qr_pay` / `receive_money` + `put_cash_in_drawer` |
| Dọn bàn | Khách rời | `wipe_table`, `wash_cup` |

UI: các **điểm chạm sáng** trên khách/máy + một nút lớn ở đáy đổi nhãn theo việc ưu tiên nhất. Hàng đợi việc tối đa 3. Có công tắc **"Tự động"** (chính sách: khách chờ lâu nhất trước) để trợ năng và để bỏ qua ca.

---

## 8. Danh mục action ưu tiên cho đợt này (40 action quán cà phê)

Làm đủ các action sau trước (trong ACTION_CATALOG của `04_MASTERPROMPT…` còn >130 action cho các đợt sau):

- **Di chuyển:** `idle_breathe`, `walk`, `run`, `walk_carry_tray`, `turn_left`, `turn_right`
- **Cửa:** `approach_door`, `check_sign`, `take_key_from_pocket`, `unlock_door`, `push_door_open`, `enter_building`, `exit_building`, `close_door`, `lock_door`, `flip_sign_to_open`, `flip_sign_to_closed`, `roll_up_shutter` (kiosk), `turn_on_lights`, `turn_off_lights`
- **Vận hành:** `wipe_table`, `arrange_chairs`, `sweep_floor`, `start_coffee_machine`, `grind_beans`, `tamp_coffee`, `pour_coffee`, `make_drink_shake`, `take_order_notepad`, `greet_customer`, `hand_cup_to_customer`, `serve_tray_to_table`, `wash_cup`, `check_fridge`
- **Tiền:** `scan_qr_pay`, `receive_money`, `put_cash_in_drawer`, `count_cash`, `hand_over_money`
- **Cảm xúc:** `nod_agree`, `shake_head_no`, `sigh_deep`, `celebrate_fist_pump`, `hands_on_head_worry`
- **Điện thoại (cho sự kiện Reviewer):** `film_video_selfie`, `post_video`, `read_comments_scroll`

**Cách có được animation:** (1) kiểm tra clip có sẵn trong GLB, (2) tải bộ animation cấp phép rõ ràng rồi **retarget offline** (Blender/công cụ tương đương) vào skeleton của Minh, (3) action còn thiếu: **tự dựng keyframe/procedural** (xoay tay, cúi người, dịch tay) và đánh dấu "[PROCEDURAL]" trong ACTION_CATALOG. Không retarget lúc chạy.

---

## 9. Asset & hướng nghệ thuật

- **Nhân vật Minh:** barista dân sự, tạp dề, tóc gọn, **không mũ bảo hiểm**; skeleton humanoid chuẩn, ≤ 8k tam giác; có socket tay trái/phải/đầu.
- **Quán:** mô-đun (tường, sàn, cửa, quầy, bàn ghế, kệ, máy pha, máy xay, tủ lạnh, bồn rửa, thùng đá, máy tính tiền/QR, bảng phấn, biển MỞ/ĐÓNG hai mặt, đèn dây, cây). Mỗi vật ≤ 3k tam giác; texture atlas ≤ 1024².
- **Khách:** 3–4 mô hình gốc + đổi màu/phụ kiện (instancing), tối đa ~8 khách cùng lúc.
- **Ánh sáng:** `HemisphereLight` + một `DirectionalLight` bóng mềm (shadow map 1024), tông ấm; **không** tối đen như ảnh số 5. Có 4 preset (sáng/trưa/chiều/tối).
- **Vật liệu:** `MeshStandardMaterial` hoặc `MeshToonMaterial` thống nhất, bảng màu bám bàn cờ 2D.
- **Nguồn asset:** chỉ giấy phép rõ ràng (CC0 hoặc tự làm). Ví dụ bộ miễn phí thường dùng: Kenney, Quaternius, KayKit (**agent tự xác minh license từng gói**, ghi `ASSET_MANIFEST.md`). Nếu thiếu mô hình thì dựng bằng primitive có hình khối hợp lý (không dùng hộp thô); không dùng nhân vật/thương hiệu có bản quyền.
- **Loại bỏ:** các đường xanh lạ ở ảnh 1, 3, 4 (agent tìm nguyên nhân và xóa).

---

## 10. Hiệu năng, trợ năng, kiểm thử

**Ngân sách:** ≤ 60k tam giác cả cảnh · ≤ 100 draw call · ≤ 1,5 MB asset cho Chương 2 (nén meshopt/Draco, WebP/KTX2) · DPR ≤ 2 · 1 canvas WebGL.

**QualityManager:** đo thời gian khung 120 khung đầu: `high` (bóng, DPR 2) → `mid` (DPR 1,5, bóng 1024) → `low` (DPR 1, không bóng/hạt) → **Chế độ nhẹ** (ảnh tĩnh 2.5D + các thẻ hành động).

**Trợ năng:** "Giảm chuyển động" (cắt cảnh mờ dần, tắt rung, rút gọn nghi thức), "Tự động" thay thao tác, chữ ≥ 14 sp, vùng chạm ≥ 48 dp, tắt âm/rung.

**Kiểm thử (domain chạy bằng Node, không cần GPU):**
- A* không kẹt; mọi anchor có đường tới; mọi `action_id` trong plan tồn tại.
- `ShiftSim` deterministic (cùng seed → cùng `ShiftResult`).
- FSM khách không rơi vào trạng thái treo.
- Tắt cờ 3D → game Chương 2 chạy như cũ; Chương 1 **không nạp** gói 3D.
- Snapshot state game trước/sau khi phát ActionPlan **giống hệt**.
- Toàn bộ test cũ vẫn pass; `npm run lint`, `npx tsc -b` sạch.

**Nghiệm thu bằng ảnh chụp (bắt buộc, agent KHÔNG được báo xong nếu thiếu):** chụp ở **390×844** và **360×800** các cảnh: (1) mặt bằng trống, (2) cửa đang mở, (3) vào trong quán, (4) đang pha chế, (5) có 3 khách trong quán, (6) cảnh Reviewer A/B/C, (7) khung nhúng cạnh bottom sheet. Mỗi ảnh phải đạt: nhân vật nhìn rõ, nhân vật ≤ 35% khung hình, camera không xuyên mesh, ánh sáng sáng ấm, không có vật thể lạ.

---

## 11. Quyết định thiết kế cần bạn chốt (mặc định đề xuất kèm theo)

| # | Câu hỏi | Mặc định đề xuất |
|---|---|---|
| D1 | Người chơi **thực sự thao tác** (giao việc) hay chỉ **xem Minh tự làm**? | Hỗ trợ **cả hai**: mặc định *Tự động* ở khung nhúng; *Làm ca* tùy chọn (chạm vào khung 3D) |
| D2 | `ShiftResult` có **tác động vào chỉ số** (hài lòng, ly/ngày) không? | **Chưa.** Chỉ hiển thị "Hiệu suất ca". Nếu muốn, thêm một modifier nhỏ (±5%) qua API chính thức của Chương 2 **sau khi chủ hệ thống Chương 2 duyệt** |
| D3 | Cảnh mở đầu: chọn mặt bằng **trước** rồi mới mở cửa? | **Có** (mặt bằng trống → chọn → mở cửa), logic nhất |
| D4 | Mỗi tháng có **1 ca** hay mỗi tình huống 1 ca? | 1 ca/tháng (45–90 s) + vignette ngắn (≤ 8 s) cho mỗi tình huống |
| D5 | Phong cách giao diện: tối (Chương 2 hiện tại) hay sáng (bàn cờ)? | **Khung 3D sáng ấm**, bao quanh bởi HUD nâu như hiện tại |
| D6 | Nhân vật chính: người (Minh) hay robot? | **Minh (người)** |

---

## 12. PROMPT V2 CHO AGENT (dán vào Antigravity, kèm file này và `04_MASTERPROMPT…`)

````
Bạn là Senior Gameplay Engineer + Technical Artist (React 19, TypeScript, Vite, Three.js).

Hãy ĐỌC KỸ file app_ui_docs/05_TECH_SPEC_CAFE3D_SOLO.md và làm đúng theo đó. Tài liệu 04_MASTERPROMPT_3D_WORLD_ACTIONS.md vẫn áp dụng cho ràng buộc an toàn và danh mục action, NHƯNG phạm vi hiện tại thu hẹp: chỉ làm quán cà phê cho Chương 2.

RÀNG BUỘC: chỉ ghi trong mobile_app/** và app_ui_docs/**; src/game, src/data, src/components, tests, api là READ-ONLY; không thêm dependency khi chưa hỏi; không commit/push; không đổi luật/engine; 3D chỉ là lớp trình bày (animation không đổi state). Mọi kết luận kèm file:dòng; không bịa.

BẮT BUỘC:
1) Bỏ "THẾ GIỚI 3D LIVE" và mọi 3D ở Chương 1. Chương 1 không được nạp gói 3D.
2) Đưa panel "ĐIỀU PHỐI HÀNH ĐỘNG 3D LIVE" vào chế độ debug (?debug=3d); bản thường chỉ chạy theo sự kiện game.
3) Dựng Chương 2: mở cửa quán → đi vào quán → vận hành MỘT MÌNH (chào khách, ghi order, pha chế, phục vụ, thu tiền, dọn bàn) theo mục 5–7 của spec. Kiến trúc 3 lớp domain/engine/react như spec; mã khung ở mục 7 là mức tối thiểu cần bám.
4) Sửa camera theo mục 7.4 (không xuyên mesh, khung hình ≤ 35%, cutaway tường). Thay nhân vật mũ bảo hiểm bằng barista Minh. Thay hộp thô bằng asset đúng (xem mục 9). Xóa các đường xanh lạ.
5) Mọi vị trí lấy từ venues/*.json (mét), không hard-code trong component.
6) Hỗ trợ 3 venue (main_street, alley, kiosk) bằng dữ liệu.

QUY TRÌNH (dừng chờ duyệt sau mỗi mốc, báo cáo ≤ 15 dòng + danh sách file + kết quả test/lint/tsc + git status chỉ đọc):
 M0  Audit: tìm nguồn dữ liệu thật của "ly/ngày", "% hài lòng", các tình huống Chương 2 (id, phương án, hệ quả), nơi sinh ra panel điều phối 3D, nơi đặt nút "THẾ GIỚI 3D LIVE", danh sách clip animation thật trong GLB. Trả lời D1–D6 bằng mặc định trừ khi tôi đổi.
 M1  Gỡ 3D khỏi Chương 1 + đưa panel vào debug + khung layout Chương 2 (mục 4). Kèm ảnh chụp.
 M2  Cảnh tĩnh quán (ngoài + trong) đúng ánh sáng/camera. Nghiệm thu bằng ảnh chụp theo mục 10.
 M3  Minh + nghi thức mở quán đầy đủ + 40 action ưu tiên (mục 8). Kèm video/ảnh liên tiếp.
 M4  ShiftSim + khách (FSM) + giao việc ngữ cảnh + chế độ Tự động.
 M5  Biến thể venue + ActionPlan cho các tình huống Chương 2 (gồm Reviewer A/B/C ngay trong quán).
 M6  Hiệu năng, chế độ nhẹ, trợ năng, test; báo cáo cuối.

TUYỆT ĐỐI KHÔNG báo "hoàn thành" một mốc nếu thiếu ảnh chụp nghiệm thu hoặc test chưa chạy thật.
````

---

## 13. BỔ SUNG 11/11 – CHỐT ENGINE & CHUỖI CÔNG CỤ ASSET

### 13.1 Chốt vai trò từng công cụ

| Vai trò | Công cụ | Ghi chú |
|---|---|---|
| **Engine chạy game (runtime)** | **Three.js đầy đủ** (đã có) | Quyết định ở mục 2 giữ nguyên. Three-Live **không** làm engine chạy game: nó chỉ hỗ trợ một tập con khai báo của Three.js, dùng renderer WebGL2 riêng, và giá trị chính là sandbox cho mã AI sinh ra lúc runtime (game không cần) |
| **Dựng mô hình, rig, animation** | **Blender + Blender MCP** (agent điều khiển Blender) | Xuất `.glb` vào `public/assets/cafe3d/` |
| **Sinh prop đơn giản bằng script** *(thử nghiệm, tùy chọn)* | `three-live-cli convert scene.js -o out.glb` | Chỉ cho vật tĩnh đơn giản (ly, ghế, bàn); không dùng cho nhân vật/animation |
| **Kiểm tra hình ảnh** | Vòng lặp "dựng → chụp → agent đánh giá riêng → sửa" | Mục 13.4 |
| **Chạy/preview** | Vite dev server (`npm --prefix mobile_app run dev`) | Theo `RUN_APP.md` |

### 13.2 Quy ước asset khi xuất từ Blender (agent bắt buộc tuân thủ)

- **Đơn vị:** 1 đơn vị = 1 mét; nhân vật cao ~1,7 m; cửa ~2,0 × 0,9 m; quầy cao ~0,9 m. Áp dụng (apply) mọi scale/rotation trước khi xuất.
- **Gốc tọa độ (origin):** đặt ở **chân/đáy** vật thể. Trục hướng lên là +Y khi xuất glTF (dùng tùy chọn "+Y Up").
- **Đặt tên (để code tự nối, không hard-code vị trí):**
  - `anchor_<id>`: empty đánh dấu điểm đứng/ngồi (xoay Y = hướng nhìn). Ví dụ `anchor_at_espresso`, `anchor_queue_1`, `anchor_seat_2`.
  - `door_<id>_pivot`: empty ở bản lề; cánh cửa là con của pivot. Ví dụ `door_front_pivot`.
  - `sign_open_closed`: biển hai mặt, có thể lật.
  - `station_<kind>`: `station_espresso`, `station_grinder`, `station_register`, `station_fridge`, `station_sink`, `station_iceBox`.
  - `occluder_*` (tường, trần có thể làm mờ khi cutaway), `cutaway_front`.
  - Nhân vật: xương chuẩn humanoid (tương thích bộ tên xương của Mixamo để retarget), thêm empty `socket_handR`, `socket_handL`, `socket_head`.
- **Animation:** **tên clip = ID action** trong `action_catalog.json` (ví dụ `unlock_door`, `greet_customer`), để `ActionRunner` tra thẳng. Mỗi clip có thời lượng, có thể lặp hay không ghi trong catalog. Xuất qua NLA/Actions.
- **Ngân sách:** theo mục 10 (≤ 3k tam giác/prop, ≤ 8k tam giác nhân vật, texture ≤ 1024², vật liệu PBR đơn giản, nén Draco/meshopt nếu exporter hỗ trợ).
- **Thư mục:** file nguồn `.blend` để ở `app_ui_docs/art_src/` (không commit, không đưa vào `public/`); chỉ `.glb` đã tối ưu vào `public/assets/cafe3d/`.
- **Giấy phép:** mọi asset tải qua Blender MCP (ví dụ từ thư viện miễn phí hoặc dịch vụ sinh 3D) phải ghi vào `ASSET_MANIFEST.md` (nguồn, license, URL). Asset tự dựng ghi "tự làm". Không dùng thương hiệu/nhân vật có bản quyền.
- **Tự kiểm tra trong Blender** (agent chạy script kiểm qua MCP trước khi xuất): số tam giác, tên anchor/pivot/socket có đủ, scale = 1, origin đúng, không vật liệu thiếu, không texture vượt kích thước.

### 13.3 Thử nghiệm Three-Live CLI cho prop (tùy chọn, nhỏ)

Chỉ làm sau khi Blender MCP đã chạy ổn. Mục tiêu: xem công cụ này có tạo nhanh được các vật đơn giản đẹp hơn "hộp thô" hay không. Làm 3–5 prop (ly, ghế, bàn tròn, đèn dây), so chất lượng với bản Blender, rồi báo cáo. **Không thêm vào bundle runtime**; nếu dùng chỉ dùng công cụ dòng lệnh ngoài dự án và ghi kết quả vào manifest. Cần người duyệt trước khi cài.

### 13.4 Vòng lặp kiểm tra hình ảnh (Visual QA loop)

1. **Builder** (agent chính) dựng/sửa.
2. Chụp màn hình bằng trình duyệt tự động ở **390×844** và **360×800** các cảnh trong mục 10. Với Blender, chụp thêm viewport nếu server MCP có công cụ chụp viewport.
3. **Reviewer** (agent/subagent khác, **không đọc mã**, chỉ nhìn ảnh) chấm theo checklist: nhân vật nhìn rõ và ≤ 35% khung, camera không xuyên mesh, ánh sáng sáng ấm, không vật lạ, hình khối đọc được là quán cà phê, màu hợp bàn cờ 2D.
4. Reviewer ghi `app_ui_docs/3d_actions/qa/QA_REPORT.md` (đạt/không đạt từng mục + ảnh dẫn chứng).
5. Builder sửa các mục không đạt; **tối đa 3 vòng**, còn lỗi thì dừng và hỏi người.
6. Không được báo hoàn thành mốc nếu QA_REPORT còn mục không đạt.

### 13.5 Cảnh báo an toàn khi dùng Blender MCP

- Server cho phép agent **chạy mã Python bất kỳ trong Blender**: dùng một file `.blend` riêng cho dự án, **không mở file quan trọng khác** trong cùng phiên, luôn có bản sao lưu/lưu phiên bản.
- **Chỉ chạy một MCP client** nối với Blender tại một thời điểm.
- Có thu thập số liệu ẩn danh về công cụ đã dùng (theo README của dự án); kiểm tra tùy chọn nếu bạn muốn tắt.
- Đừng để agent tự tải model từ nguồn không rõ license; mọi thứ qua `ASSET_MANIFEST.md`.

---

## 14. KẾT NỐI BLENDER MCP VỚI ANTIGRAVITY (Windows, từng bước)

**Chuẩn bị:** Blender 3.0 trở lên (một số bản fork cần 4.0+), Python 3.10 trở lên, trình quản lý gói **`uv`**.

**Bước 1 – Cài `uv` (PowerShell):**
```
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```
Thêm thư mục chứa `uv` vào PATH (thường `%USERPROFILE%\.local\bin`), rồi **thoát hẳn và mở lại Antigravity**. Gõ `uvx --version` trong terminal mới để kiểm tra. (Không dùng `pip install uv`.)

**Bước 2 – Cài addon vào Blender:**
1. Tải `addon.py` từ repo Blender MCP (hoặc chạy `uvx mcp-for-blender install-addon` nếu dùng gói mới).
2. Blender → **Edit → Preferences → Add-ons → Install…** → chọn `addon.py` → tick **"Interface: Blender MCP"**.
3. Trong khung 3D bấm **N** → tab **BlenderMCP** → bấm **Connect/Start** (nút kết nối) để bật server socket (mặc định cổng **9876**).

**Bước 3 – Khai báo server trong Antigravity:**
1. Mở panel Agent → menu **"…"** → **MCP Servers** → **Manage MCP Servers** → **View raw config** (mở `mcp_config.json`).
2. Thêm:
```json
{
  "mcpServers": {
    "blender": {
      "command": "uvx",
      "args": ["blender-mcp"]
    }
  }
}
```
Theo trang PyPI, gói `blender-mcp` đã đổi tên thành `mcp-for-blender`; cấu hình cũ vẫn chạy, cài mới nên dùng tên mới. **Nếu Windows không tìm thấy `uvx`** hoặc lỗi nối, dùng:
```json
{
  "mcpServers": {
    "blender": {
      "command": "cmd",
      "args": ["/c", "uvx", "mcp-for-blender"]
    }
  }
}
```
3. Lưu file → quay lại **Manage MCP Servers** → bấm **Refresh** → **thoát hẳn và mở lại Antigravity**.

**Bước 4 – Kiểm tra:** thấy server `blender` bật và có danh sách công cụ. Gõ cho agent: *"Dùng Blender MCP, liệt kê các object đang có trong scene Blender."* Nếu trả về danh sách là đã nối thành công.

**Nếu gặp lỗi:**

| Triệu chứng | Cách xử lý |
|---|---|
| Lỗi "invalid trailing data" trên Windows | Dùng bản fork dành riêng cho Antigravity (Windows) sửa lỗi stdio; cấu hình bằng `python` + đường dẫn tuyệt đối tới `server.py` của fork đó (cần Python 3.10+). Kiểm tra repo trước khi tin dùng |
| Không kết nối | Kiểm tra addon đang bật server ở tab BlenderMCP; **đừng tự chạy `uvx` trong terminal** (để Antigravity khởi chạy); lệnh đầu đôi khi thất bại, thử lại |
| Xung đột phiên bản Python | Thêm `"--python","3.11"` vào `args` và `"env": {"UV_PYTHON_PREFERENCE": "only-managed"}`; xóa cache: `uv cache clean blender-mcp` rồi `uvx --refresh blender-mcp` |
| Cổng khác 9876 | Đặt biến môi trường `BLENDER_HOST`, `BLENDER_PORT` trong `env`, addon và server phải trùng cổng |
| Lệnh lớn bị treo | Chia nhỏ yêu cầu (một vật, một animation mỗi lần) |

---

## 15. PROMPT BỔ SUNG CHO AGENT (mốc M1.5 – dựng asset bằng Blender MCP)

````
Đọc mục 13–14 của app_ui_docs/05_TECH_SPEC_CAFE3D_SOLO.md.

Nếu server "blender" chưa kết nối: DỪNG và hướng dẫn tôi làm theo mục 14 (không tự ý cài đặt ngoài phạm vi). Nếu đã kết nối:
1. Chỉ dùng file .blend riêng cho dự án đặt ở app_ui_docs/art_src/. Không mở file khác.
2. Dựng nhân vật Minh (barista, không mũ bảo hiểm) và bộ props/venue theo quy ước mục 13.2 (tên anchor/pivot/socket, đơn vị mét, origin ở đáy, tam giác trong ngân sách).
3. Trước khi xuất .glb, chạy script kiểm trong Blender (qua MCP) để xác minh quy ước; sửa đến khi đạt.
4. Xuất .glb vào mobile_app/public/assets/cafe3d/ và cập nhật ASSET_MANIFEST.md cho TỪNG asset (nguồn, license, tác giả/URL, số tam giác, kích thước).
5. Chạy vòng kiểm tra hình ảnh (mục 13.4) và lưu QA_REPORT.md; tối đa 3 vòng sửa rồi dừng hỏi tôi.
6. Không thêm dependency, không sửa vùng READ-ONLY, không commit. Dừng chờ duyệt cuối mốc.
````

---

## 16. Rủi ro

| # | Rủi ro | Giảm thiểu |
|---|---|---|
| R1 | Thiếu animation phù hợp để retarget | Procedural cho action thiếu; đánh dấu và làm theo đợt |
| R2 | Asset miễn phí không đủ phong cách Việt Nam | Làm "skin" bằng màu/texture, thêm props đặc trưng (đèn dây, bảng phấn, nón lá) |
| R3 | Chế độ làm ca làm Chương 2 quá dài | Tự động + Bỏ qua + x2, mỗi tháng chỉ 1 ca ngắn |
| R4 | Chỉ số `ly/ngày`, `hài lòng` có thể nằm trong code READ-ONLY | M0 xác minh; domain chỉ đọc, không ghi |
| R5 | Hiệu năng trên máy yếu | QualityManager + Chế độ nhẹ |
| R6 | Lệch số đếm Chương: STORY_RPG gọi quán là Chương 1, app là Chương 2 | Cập nhật tài liệu sau khi duyệt luồng |
| R7 | `app_ui_docs/` đang `.gitignore` | **Không commit** |
