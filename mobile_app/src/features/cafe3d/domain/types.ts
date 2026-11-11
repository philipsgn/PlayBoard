export type VenueId = 'main_street' | 'alley' | 'kiosk';

/** Dữ liệu CHỈ ĐỌC lấy từ game Chương 2. */
export interface CafeStateView {
  seed: string;
  month: number;
  situationIndex: number; // 1..4
  venue: VenueId | null;
  cash: number;
  cupsPerDay: number; // chỉ số "ly/ngày" trong HUD
  satisfaction: number; // 0..100, "% hài lòng"
  equipmentTier?: number;
}

/** Sự kiện phát ra từ game để Director phản ứng. */
export type CafeEvent =
  | { type: 'chapterEntered' }
  | { type: 'venueChosen'; venue: VenueId; deposit: number }
  | { type: 'monthStarted'; month: number }
  | { type: 'situationShown'; id: string }
  | { type: 'optionChosen'; id: string; option: 'A' | 'B' | 'C'; effects: Record<string, number> }
  | { type: 'monthEnded'; summary: Record<string, number> };

export interface Anchor {
  id: string;
  pos: [number, number, number]; // mét; x phải, y lên, z về phía camera
  faceDeg: number; // hướng nhìn quanh trục Y
  kind: 'stand' | 'station' | 'queue' | 'seat' | 'door' | 'spawn';
}

export interface WaypointGraph {
  nodes: { id: string; pos: [number, number, number] }[];
  edges: [string, string][];
}

export interface DoorSpec {
  id: string;
  pivot: [number, number, number];
  closedDeg: number;
  openDeg: number; // ví dụ 90 (xoay vào trong)
  signId?: string; // biển MỞ/ĐÓNG
  lockable: boolean;
}

export interface CameraPreset {
  offset: [number, number, number];
  lookAtOffset: [number, number, number];
  fovDeg: number;
  minDistance: number;
}

export interface LightingPreset {
  sky: string;
  ground: string;
  sunColor: string;
  sunIntensity: number;
  sunDir: [number, number, number];
  exposure: number;
}

export interface VenueConfig {
  id: VenueId;
  name: string;
  model?: string;
  hasInterior: boolean;
  anchors: Anchor[];
  graph: WaypointGraph;
  doors: DoorSpec[];
  stations: { id: string; anchorId: string; kind: 'espresso' | 'grinder' | 'register' | 'fridge' | 'sink' | 'iceBox' }[];
  seats: { id: string; anchorId: string }[];
  camera: Record<'exterior' | 'interior' | 'counter' | 'closeup', CameraPreset>;
  lighting: Record<'morning' | 'noon' | 'evening' | 'night', LightingPreset>;
}

export interface RecipeStep {
  kind: 'grind' | 'brew' | 'steam' | 'pour' | 'ice' | 'mix' | 'garnish';
  sec: number;
}

export interface Recipe {
  id: string;
  name: string;
  price: number;
  steps: RecipeStep[];
}

export type CustomerArchetype = 'student' | 'office' | 'elder' | 'tourist' | 'reviewer';

export type CustomerState =
  | 'approach'
  | 'queue'
  | 'ordering'
  | 'waiting'
  | 'served'
  | 'seated'
  | 'leaving'
  | 'angryLeaving';

export interface Customer {
  id: string;
  archetype: CustomerArchetype;
  patience: number; // giây còn lại, giảm dần
  maxPatience: number;
  order?: string; // recipe id
  state: CustomerState;
  seatId?: string;
  waitTime: number;
}

export interface ShiftConfig {
  cupsPerDay: number;
  shiftSeconds: number;
  shiftScale: number;
  venue: VenueId;
  seed: string;
}

export interface ShiftResult {
  served: number;
  walkedOut: number;
  avgWaitSec: number;
  mistakes: number;
  satisfactionDelta: number;
  bonusTips: number;
}

export interface Task {
  id: string;
  kind: 'greet' | 'order' | 'brew' | 'serve' | 'pay' | 'clean';
  customerId?: string;
  stationId?: string;
  recipeId?: string;
  durationSec: number;
}

