import { getChapterPreset, type BoardChapterId } from '../data/chapter-presets.ts'
import { copyState, record, snapshot } from './state.ts'
import { saleQuote } from './selectors.ts'
import { syncValuations } from './market.ts'
import { money } from './format.ts'
import type { GameState, TradableAsset } from './types.ts'

export function chapterIdForGame(state: { chapterId?: BoardChapterId }): BoardChapterId {
  return state.chapterId ?? 1
}

export function safeBufferForGame(state: { chapterId?: BoardChapterId }): number {
  return getChapterPreset(chapterIdForGame(state)).safeEmergencyBuffer
}

/**
 * Tính chi phí sinh hoạt theo Vòng và Chương (Lạm phát lũy tiến ở Chương 2 & 3).
 * Chương 1 giữ nguyên tuyệt đối mức chuẩn B18 (5.000.000 VND).
 */
export function progressiveLivingCost(state: { chapterId?: BoardChapterId; lap: number }, fallbackCost: number): number {
  if (!state.chapterId || state.chapterId === 1) {
    return fallbackCost
  }
  const preset = getChapterPreset(state.chapterId)
  const inflation = Math.max(0, state.lap - 1) * preset.livingInflationPerLap
  return Math.round(preset.baseLivingCost + inflation)
}

/**
 * Tổng giá trị tài sản thanh khoản dùng làm tài sản đảm bảo (Collateral Base):
 * Tiền mặt + Gốc tiết kiệm đang hoạt động + Giá bán ròng Cổ phiếu, Trái phiếu, Vàng.
 */
export function liquidCollateralValue(state: GameState): number {
  const activeDeposits = state.deposits
    .filter(lot => lot.status === 'active')
    .reduce((sum, lot) => sum + lot.principal, 0)
  const tradableNet = (['stocks', 'bonds', 'gold'] as TradableAsset[])
    .reduce((sum, asset) => sum + saleQuote(state, asset).net, 0)
  return Math.max(0, Math.round(state.portfolio.cash + activeDeposits + tradableNet))
}

/**
 * Tỷ lệ Đòn bẩy (Leverage Ratio = Debt / Liquid Collateral Base).
 */
export function leverageRatio(state: GameState): number {
  if (state.portfolio.debt <= 0) return 0
  const collateral = liquidCollateralValue(state)
  if (collateral <= 0) return 1.0
  return state.portfolio.debt / collateral
}

/**
 * Kiểm tra trạng thái rủi ro Đòn bẩy / Call Margin cho HUD và Cảnh báo.
 */
export function marginStatus(state: GameState): {
  enabled: boolean
  ratio: number
  threshold: number
  isWarning: boolean
  isMarginCall: boolean
} {
  const preset = getChapterPreset(chapterIdForGame(state))
  const ratio = leverageRatio(state)
  return {
    enabled: preset.enableMarginCall || state.chapterId === 2,
    ratio,
    threshold: preset.marginCallThreshold,
    isWarning: state.portfolio.debt > 0 && ratio >= 0.45 && ratio <= preset.marginCallThreshold,
    isMarginCall: preset.enableMarginCall && state.portfolio.debt > 0 && ratio > preset.marginCallThreshold,
  }
}

/**
 * Thực thi Cưỡng chế Call Margin (Chương 3):
 * Khi tỷ lệ Nợ / Tài sản đảm bảo thanh khoản > 60% (0.60), hệ thống tự động
 * bán cưỡng bức Cổ phiếu và Vàng (chịu phạt 5% chiết khấu thanh lý) để trả bớt nợ.
 */
export function evaluateAndExecuteMarginCall(state: GameState): GameState {
  const preset = getChapterPreset(chapterIdForGame(state))
  if (!preset.enableMarginCall || state.portfolio.debt <= 0) return state

  const currentRatio = leverageRatio(state)
  if (currentRatio <= preset.marginCallThreshold) return state

  const before = snapshot(state)
  const s = copyState(state)
  const collateral = liquidCollateralValue(s)
  // Mục tiêu: Đưa nợ về mức marginTargetRatio (45%) của tài sản đảm bảo
  const targetDebt = Math.floor(collateral * preset.marginTargetRatio)
  const debtToReduce = Math.max(0, s.portfolio.debt - targetDebt)
  if (debtToReduce <= 0) return state

  let cashRaised = 0
  let grossSoldStocks = 0
  let grossSoldGold = 0
  let totalPenalty = 0

  // 1. Bán cưỡng bức Cổ phiếu trước
  if (s.portfolio.stocks > 0 && cashRaised < debtToReduce) {
    const needed = debtToReduce - cashRaised
    // Ước tính lượng gross cần bán (tính cả phí 1% + phạt 5% = 6%)
    const grossToSell = Math.min(s.portfolio.stocks, Math.ceil(needed / (1 - 0.01 - preset.marginLiquidationPenalty)))
    if (grossToSell > 0) {
      const fraction = Math.min(1, grossToSell / s.portfolio.stocks)
      for (const stock of s.market.stocks) {
        const holding = s.stockHoldings[stock.id]
        if (holding) {
          holding.units *= 1 - fraction
          holding.costBasis *= 1 - fraction
        }
      }
      const quote = saleQuote(state, 'stocks', grossToSell)
      const penalty = Math.round(quote.net * preset.marginLiquidationPenalty)
      const netProceeds = Math.max(0, quote.net - penalty)
      cashRaised += netProceeds
      grossSoldStocks = grossToSell
      totalPenalty += quote.fee + penalty
    }
  }

  // 2. Nếu vẫn thiếu, bán cưỡng bức Vàng
  if (s.portfolio.gold > 0 && cashRaised < debtToReduce) {
    const needed = debtToReduce - cashRaised
    const grossToSell = Math.min(s.portfolio.gold, Math.ceil(needed / (1 - 0.04 - preset.marginLiquidationPenalty)))
    if (grossToSell > 0) {
      const fraction = Math.min(1, grossToSell / s.portfolio.gold)
      s.goldUnits *= 1 - fraction
      s.goldCostBasis *= 1 - fraction
      const quote = saleQuote(state, 'gold', grossToSell)
      const penalty = Math.round(quote.net * preset.marginLiquidationPenalty)
      const netProceeds = Math.max(0, quote.net - penalty)
      cashRaised += netProceeds
      grossSoldGold = grossToSell
      totalPenalty += quote.fee + quote.spread + penalty
    }
  }

  // 3. Nếu vẫn thiếu, trích thêm từ tiền mặt sẵn có để hạ nợ
  const cashFromWallet = Math.min(s.portfolio.cash, Math.max(0, debtToReduce - cashRaised))
  const totalRepaid = Math.min(s.portfolio.debt, cashRaised + cashFromWallet)

  if (totalRepaid <= 0 && grossSoldStocks === 0 && grossSoldGold === 0) return state

  s.portfolio.cash = Math.max(0, s.portfolio.cash + cashRaised - totalRepaid)
  s.portfolio.debt = Math.max(0, s.portfolio.debt - totalRepaid)
  s.marginCallCount = (s.marginCallCount ?? 0) + 1
  syncValuations(s)

  return record(s, before, {
    kind: 'rebalancing',
    title: 'Lệnh Call Margin Cưỡng Chế',
    decisionId: 'forced-margin-call',
    decision: `Tỷ lệ đòn bẩy ${(currentRatio * 100).toFixed(0)}% vượt ngưỡng 60%`,
    consequence: `Thanh lý cưỡng bức ${money(grossSoldStocks + grossSoldGold)} tài sản (phí & phạt 5%: ${money(totalPenalty)}) để hạ nợ ${money(totalRepaid)}.`,
    forcedAssetSaleAmount: grossSoldStocks + grossSoldGold,
    assetSaleAmounts: { stocks: grossSoldStocks, bonds: 0, gold: grossSoldGold },
    cashProceeds: cashRaised,
  })
}

/**
 * Vay đòn bẩy chủ động ở Chương 2 & Chương 3 (trong hạn mức borrowingLimit).
 */
export function borrowLeverage(state: GameState, amount: number): GameState {
  if ((state.chapterId ?? 1) < 2) {
    throw new Error('Vay đòn bẩy đầu tư chủ động chỉ mở từ Chương 2.')
  }
  const available = Math.max(0, state.borrowingLimit - state.portfolio.debt)
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > available) {
    throw new Error('Số tiền vay đòn bẩy không hợp lệ hoặc vượt hạn mức khả dụng.')
  }
  const before = snapshot(state)
  const s = copyState(state)
  s.portfolio.cash += amount
  s.portfolio.debt += amount
  return record(s, before, {
    kind: 'rebalancing',
    title: 'Giải ngân đòn bẩy đầu tư',
    decisionId: 'borrow-leverage',
    decision: `Vay đòn bẩy ${money(amount)}`,
    consequence: `Nhận +${money(amount)} tiền mặt, tổng nợ ${money(s.portfolio.debt)}/${money(s.borrowingLimit)}. Lưu ý lãi vay 10%/vòng và ngưỡng Call Margin 60%.`,
  })
}
