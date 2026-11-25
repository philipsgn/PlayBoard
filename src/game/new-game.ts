import { createGame } from './engine.ts'
import { generateGameSeed } from './seed.ts'
import { getChapterPreset, type BoardChapterId } from '../data/chapter-presets.ts'
import { snapshot } from './state.ts'
import { openDeposit } from './transactions.ts'
import type { BondRulesVersion, GameModeId, GameState, LivingExpenseRulesVersion, Term } from './types.ts'

// Player entry point. createGame remains the historical/replay API with legacy catalog defaults.
export function createPlayerGame(seed: string | undefined, savings: number, term: Term = 1, mode: GameModeId = 'experimental-b', bondRulesVersion: BondRulesVersion = 'v2.5-credit-risk', livingExpenseRulesVersion?: LivingExpenseRulesVersion) {
  return createGame(seed?.trim() || generateGameSeed(), savings, term, mode, undefined, 'v2.4-customer-preferences', 'v2.4-atomic-investments', 'vn-v1', bondRulesVersion, livingExpenseRulesVersion)
}

// The new-player path is explicit; historical APIs never infer B18 from C20.
export function createCoreMvpGame(seed?: string, savings = 0, term: Term = 1) {
  return createGame(seed?.trim() || generateGameSeed(),savings,term,'experimental-b','v2.2-c20','v2.4-customer-preferences','b18-tile-trading-v1','vn-v1','v2.5-credit-risk','b18-periodic-start-v1','core-mvp-b18-v1')
}
// New player candidate. The single-course factory remains frozen for saves/replays.
export function createMultiCourseGame(seed?: string, savings = 0, term: Term = 1) {
  return createGame(seed?.trim() || generateGameSeed(),savings,term,'experimental-b','v2.2-c20','v2.4-customer-preferences','b18-tile-trading-v1','vn-v1','v2.5-credit-risk','b18-periodic-start-v1','core-mvp-b18-multi-course-v1')
}

/**
 * Tạo ván cờ tỷ phú tài chính theo Chương (Chương 1: 50M->90M, Chương 2: 90M+->180M, Chương 3: 180M+->360M).
 * Chương 1 không truyền carryover giữ nguyên cấu trúc snapshot B18 chuẩn 100%.
 */
export function createChapterBoardGame(
  chapterId: BoardChapterId = 1,
  seed?: string,
  carryoverBonus = 0,
  savings = 0,
  term: Term = 1
): GameState {
  if (chapterId === 1 && carryoverBonus === 0) {
    return createMultiCourseGame(seed, savings, term)
  }
  const preset = getChapterPreset(chapterId)
  const cappedBonus = Math.min(preset.maxCarryoverBonus, Math.max(0, Math.round(carryoverBonus)))
  const startingCapital = preset.baseStartingCapital + cappedBonus
  if (!Number.isInteger(savings) || savings < 0 || savings > startingCapital) {
    throw new Error('Phân bổ tiết kiệm không hợp lệ.')
  }

  const base = createMultiCourseGame(seed, 0, 1)
  const configured: GameState = {
    ...base,
    chapterId,
    startingCapitalOverride: startingCapital,
    targetGoalOverride: preset.targetGoal,
    totalLaps: preset.totalLaps,
    recurringIncome: preset.recurringIncome,
    borrowingLimit: preset.borrowingLimit,
    delayedEffects: {
      insuredLapsRemaining: 0,
      businessRevenuePenaltyNextLap: false,
    },
    marginCallCount: 0,
    portfolio: {
      ...base.portfolio,
      cash: startingCapital,
      savings: 0,
    },
    deposits: [],
  }
  const beforeSetup = snapshot(configured)
  if (savings > 0) {
    openDeposit(configured, savings, term)
  }
  const afterSetup = snapshot(configured)
  configured.log = [{
    ...base.log[0],
    title: `Bắt đầu ${preset.title}`,
    decision: `Phân bổ ${savings} VND vào tiết kiệm`,
    consequence: `${startingCapital.toLocaleString('vi-VN')} VND vốn khởi điểm (mục tiêu ${preset.targetGoal.toLocaleString('vi-VN')} VND).`,
    before: beforeSetup,
    after: afterSetup,
    cashDelta: afterSetup.portfolio.cash - beforeSetup.portfolio.cash,
    savingsDelta: afterSetup.portfolio.savings - beforeSetup.portfolio.savings,
  }]
  return configured
}
