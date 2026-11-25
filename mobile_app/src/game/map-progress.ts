// Episodic Map & 3-Chapter Financial Boardgame Progression
// PlayBoard — Cờ Tỷ Phú Đầu Tư Tài Chính 3 Chương (50M -> 90M -> 180M -> 360M VND)

import type { BoardChapterId } from '../../../src/data/chapter-presets';

export type NodeStatus = 'completed' | 'active' | 'locked';

export interface MapNodeConfig {
  id: string; // '1.1', '1.2', '1.3'
  chapterId: BoardChapterId; // 1, 2, 3
  stageNumber: number; // 1, 2, 3
  title: string;
  subtitle: string;
  description: string;
  financialGoalText: string;
  targetNetWorth: number; // in VND
  rewards: { gold: number; gems: number };
  x: number; // Percentage coordinate for winding trail (0 - 100)
  y: number; // Top percentage coordinate (0 - 100)
}

export interface MilestoneChestConfig {
  id: string;
  name: string;
  requiredNodeId: string;
  rewards: { gold: number; gems: number };
  x: number;
  y: number;
}

export interface PlayerMapProgress {
  currentChapter: BoardChapterId;
  activeNodeId: string;
  completedNodeIds: string[];
  openedChestIds: string[];
  gems: number;
  gold: number;
  unlockedChapters: number[];
}

export const MAP_1_NODES: MapNodeConfig[] = [
  {
    id: '1.1',
    chapterId: 1,
    stageNumber: 1,
    title: 'Chương 1: Khởi Đầu Tích Lũy',
    subtitle: '50M → 90M VND · 4 Vòng · Đệm 10M',
    description: 'Nhận 50M vốn ban đầu trên bàn cờ B18 (4 Quý). Giữ kỷ luật đệm tiền mặt 10M, tránh phạt rút tiết kiệm sớm và huy động hợp lệ tối thiểu 90M VND.',
    financialGoalText: 'Huy động hợp lệ ≥ 90.000.000 ₫ sau 4 vòng.',
    targetNetWorth: 90_000_000,
    rewards: { gold: 2_000_000, gems: 30 },
    x: 46.5,
    y: 84.5,
  },
  {
    id: '1.2',
    chapterId: 2,
    stageNumber: 2,
    title: 'Chương 2: Đòn Bẩy Tăng Trưởng',
    subtitle: '90M+ → 180M VND · 4 Vòng · Hệ Quả Trễ',
    description: 'Kế thừa 90M (+ tối đa 15M vốn thưởng). Ứng phó lạm phát sinh hoạt phí +1M/vòng, rủi ro trái phiếu V2.5 và thẻ tình huống hệ quả trễ để chạm mốc 180M VND.',
    financialGoalText: 'Huy động hợp lệ ≥ 180.000.000 ₫ sau 4 vòng.',
    targetNetWorth: 180_000_000,
    rewards: { gold: 5_000_000, gems: 60 },
    x: 76.5,
    y: 58.5,
  },
  {
    id: '1.3',
    chapterId: 3,
    stageNumber: 3,
    title: 'Chương 3: Bão Vĩ Mô & Tự Do Tài Chính',
    subtitle: '180M+ → 360M VND · 5 Vòng · Call Margin',
    description: 'Chặng đỉnh cao với 180M (+ tối đa 30M vốn thưởng) qua 5 vòng chu kỳ kinh tế. Sử dụng đòn bẩy khôn ngoan, phòng vệ Call Margin (> 60%) và về đích 360M VND.',
    financialGoalText: 'Huy động hợp lệ ≥ 360.000.000 ₫ sau 5 vòng.',
    targetNetWorth: 360_000_000,
    rewards: { gold: 10_000_000, gems: 120 },
    x: 38.5,
    y: 32.0,
  },
];

export const MAP_1_CHESTS: MilestoneChestConfig[] = [
  {
    id: 'chest-mid',
    name: 'Rương Tăng Tốc',
    requiredNodeId: '1.1',
    rewards: { gold: 1_500_000, gems: 25 },
    x: 52,
    y: 48,
  },
  {
    id: 'chest-boss',
    name: 'Kho Báu Tự Do Tài Chính',
    requiredNodeId: '1.3',
    rewards: { gold: 5_000_000, gems: 80 },
    x: 50,
    y: 7,
  },
];

const MAP_PROGRESS_KEY = 'xvtl:mobile:map_progress:v1';

export function getInitialMapProgress(): PlayerMapProgress {
  return {
    currentChapter: 1,
    activeNodeId: '1.1',
    completedNodeIds: [],
    openedChestIds: [],
    gems: 50,
    gold: 50_000_000,
    unlockedChapters: [1],
  };
}

export function loadMapProgress(): PlayerMapProgress {
  try {
    const raw = window.localStorage.getItem(MAP_PROGRESS_KEY);
    if (!raw) return getInitialMapProgress();
    const parsed = JSON.parse(raw);
    return {
      currentChapter: parsed.currentChapter ?? 1,
      activeNodeId: parsed.activeNodeId ?? '1.1',
      completedNodeIds: Array.isArray(parsed.completedNodeIds) ? parsed.completedNodeIds : [],
      openedChestIds: Array.isArray(parsed.openedChestIds) ? parsed.openedChestIds : [],
      gems: parsed.gems ?? 50,
      gold: parsed.gold ?? 50_000_000,
      unlockedChapters: Array.isArray(parsed.unlockedChapters) ? parsed.unlockedChapters : [1],
    };
  } catch {
    return getInitialMapProgress();
  }
}

export function saveMapProgress(progress: PlayerMapProgress): void {
  try {
    window.localStorage.setItem(MAP_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Non-blocking for environments where local storage is full or restricted
  }
}

export function unlockNextNode(completedId: string, current: PlayerMapProgress): PlayerMapProgress {
  const completed = Array.from(new Set([...current.completedNodeIds, completedId]));
  const nodeOrder = MAP_1_NODES.map(n => n.id);
  const idx = nodeOrder.indexOf(completedId);
  const nextNodeId = idx !== -1 && idx < nodeOrder.length - 1 ? nodeOrder[idx + 1] : completedId;
  const unlockedChapters = [...current.unlockedChapters];

  if (completedId === '1.1' && !unlockedChapters.includes(2)) {
    unlockedChapters.push(2);
  }
  if (completedId === '1.2' && !unlockedChapters.includes(3)) {
    unlockedChapters.push(3);
  }

  const updated: PlayerMapProgress = {
    ...current,
    completedNodeIds: completed,
    activeNodeId: nextNodeId,
    unlockedChapters,
  };
  saveMapProgress(updated);
  return updated;
}
