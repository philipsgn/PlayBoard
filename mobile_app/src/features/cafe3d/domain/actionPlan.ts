import type { Anchor } from './types.ts';

export interface AtomicAction {
  id: string; // vd 'unlock_door', 'greet_customer'
  clip: string | null; // Tên clip trong GLB, hoặc null nếu procedural
  durationSec?: number;
  loop?: boolean;
  needsAnchor?: Anchor['kind'];
  attach?: { socket: 'handR' | 'handL' | 'head'; prop: string }[];
  detach?: string[];
  reducedMotion?: 'skip' | 'snap';
  sfx?: string;
}

export interface Step {
  do: string; // id của AtomicAction
  at?: string; // anchorId hoặc interactableId
  wait?: number;
  parallel?: Step[];
  vfx?: string;
  props?: string[];
  bind?: 'cups' | 'satisfaction' | 'cash'; // hiển thị gắn state
}

export interface ActionPlan {
  id: string;
  steps: Step[];
  maxSeconds: number;
  skippable: true;
  shortVariant?: string;
}
