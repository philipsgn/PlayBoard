import type { DelayedConsequenceState, GameEvent, GameplayProfile } from '../game/types.ts'
import { ECONOMY, RULES, MACRO_EVENTS } from './config.ts'
import { money } from '../game/format.ts'
import { isCoreMvp, isMultiCourse, rulesForGame } from '../game/rules-profile.ts'
import { MULTI_COURSES } from './courses.ts'
import { getChapterPreset } from './chapter-presets.ts'

const skip = { id: 'skip', label: 'Bỏ qua cơ hội', detail: 'Giữ tiền mặt, không thay đổi danh mục.' }
const payment = (cost: number) => ({ id: 'pay', label: `Thanh toán ${money(cost)}`, detail: 'Nếu thiếu tiền, bạn chọn nguồn thanh toán.', cost })
const defer = (obligation: number) => ({ id: 'defer', label: 'Thanh toán cuối vòng', detail: `Nghĩa vụ tại START +${money(obligation)}.`, obligation })
export const EVENTS: GameEvent[] = [
  ...(['stocks', 'bonds', 'gold', 'business'] as const).map(asset => ({
    id: asset, category: 'investment' as const,
    title: { stocks: 'Cổ phiếu hư cấu', bonds: 'Trái phiếu hư cấu', gold: 'Vàng giả lập', business: 'Cơ sở kinh doanh' }[asset],
    description: 'Chỉ giao dịch tại ô tương ứng. Xem báo giá và dòng tiền trước khi quyết định.', options: [skip],
  })),
  { id: 'bank', category: 'investment', title: 'Ngân hàng', description: 'Mỗi lần gửi tạo khoản riêng, kỳ hạn 1/2/3 lần qua START; không tự tái tục.', options: [skip] },
  { id: 'course', category: 'income', title: 'Khóa học chuyên môn', description: 'Học một lần trong màn. Lương tăng từ START kế tiếp; học phí không hoàn lại.', options: [
    { id: 'upgrade', label: `Tham gia khóa học ${money(RULES.courseCost)}`, detail: `Lương +${money(RULES.courseBoost)}/vòng từ START kế tiếp.`, cost: RULES.courseCost, recurringIncomeIncrease: RULES.courseBoost }, skip] },
  { id: 'living', category: 'obligation', title: 'Chi phí sinh hoạt', description: 'Bắt buộc khi dừng đúng ô. Đi ngang qua không trả; START không trừ lại.', options: [payment(RULES.livingCost)] },
  { id: 'medical', category: 'shock', title: 'Một hóa đơn bất ngờ', description: 'Chi phí khám chữa bệnh cần được giải quyết.', options: [payment(ECONOMY.personal.medical[0]), defer(ECONOMY.personal.medical[1])] },
  { id: 'repair', category: 'shock', title: 'Chiếc xe cần sửa', description: 'Chọn sửa ngay hoặc sửa tạm rồi thanh toán phần còn lại.', options: [
    { ...payment(ECONOMY.personal.repair[0]), id: 'full' }, { id: 'temporary', label: 'Sửa tạm, hoàn tất cuối vòng', detail: `Trả ${money(ECONOMY.personal.repair[1])} ngay + ${money(ECONOMY.personal.repair[2])} tại START.`, cost: ECONOMY.personal.repair[1], obligation: ECONOMY.personal.repair[2] }] },
  { id: 'family', category: 'shock', title: 'Gia đình cần hỗ trợ', description: 'Chọn thời điểm thanh toán phù hợp với dòng tiền.', options: [payment(ECONOMY.personal.family[0]), defer(ECONOMY.personal.family[1])] },
  { id: 'bills', category: 'obligation', title: 'Đến kỳ thanh toán', description: 'Trả sớm được giảm phí.', options: [payment(ECONOMY.obligation.bills[0]), defer(ECONOMY.obligation.bills[1])] },
  { id: 'contract', category: 'obligation', title: 'Khoản phí hợp đồng', description: 'Một khoản phí đã cam kết đến hạn.', options: [payment(ECONOMY.obligation.contract[0]), defer(ECONOMY.obligation.contract[1])] },
  { id: 'bonus', category: 'obligation', title: 'Thưởng hợp đồng', description: 'Bạn nhận khoản thưởng một lần, không tăng lương định kỳ.', options: [{ id: 'receive', label: 'Nhận thưởng', detail: `Tiền mặt +${money(ECONOMY.obligation.bonus)}.`, income: ECONOMY.obligation.bonus }] },
  ...MACRO_EVENTS.map(event => ({ id: event.id, category: 'shock' as const, title: event.label,
    description: 'Cú sốc đã cập nhật ngay toàn thị trường và trạng thái kinh doanh, kể cả tài sản bạn chưa sở hữu. Không lặp tại START.',
    options: [{ id: 'acknowledge', label: 'Đã xem tác động', detail: 'Tiếp tục từ giá sau cú sốc.' }] })),
]

const scale500k = (amount: number, mult: number) => Math.round((amount * mult) / 500_000) * 500_000

export function eventsForGame(game: { gameplayProfile?: GameplayProfile; chapterId?: 1 | 2 | 3; delayedEffects?: DelayedConsequenceState }): GameEvent[] {
  let baseEvents: GameEvent[]
  if (isMultiCourse(game)) {
    baseEvents = EVENTS.map(event => event.id !== 'course' ? event : {
      ...event,title:'Đầu tư bản thân',description:'Hai khóa độc lập, học theo bất kỳ thứ tự nào. Mỗi lần ghé mua tối đa một khóa; lương tăng từ START kế tiếp.',
      options:[...MULTI_COURSES.map(c => ({id:`course-${c.id}`,label:`Mua ${c.name.toLowerCase()}`,cost:c.cost,recurringIncomeIncrease:c.boost,
        detail:`Học phí ${money(c.cost)} bằng tiền mặt; lương +${money(c.boost)}/START từ lần qua START tiếp theo. Không hoàn học phí.`})),skip],
    })
  } else if (!isCoreMvp(game)) {
    baseEvents = EVENTS
  } else {
    const rules = rulesForGame(game)
    baseEvents = EVENTS.map(event => event.id !== 'course' ? event : { ...event, options: [
      { id:'upgrade',label:`Tham gia khóa học ${money(rules.courseCost!)}`,detail:`Lương +${money(rules.courseBoost!)}/vòng từ START kế tiếp.`,cost:rules.courseCost,recurringIncomeIncrease:rules.courseBoost },skip,
    ] })
  }

  if (!game.chapterId || game.chapterId === 1) return baseEvents

  const preset = getChapterPreset(game.chapterId)
  const mult = preset.eventScaleMultiplier
  const insured = (game.delayedEffects?.insuredLapsRemaining ?? 0) > 0

  return baseEvents.map(event => {
    if (['medical', 'repair', 'family'].includes(event.id)) {
      const scaledOptions = event.options.map(opt => ({
        ...opt,
        ...(opt.cost ? { cost: scale500k(opt.cost, mult), label: opt.id === 'pay' || opt.id === 'full' ? `Thanh toán ${money(scale500k(opt.cost, mult))}` : opt.label } : {}),
        ...(opt.obligation ? { obligation: scale500k(opt.obligation, mult), detail: opt.id === 'defer' ? `Nghĩa vụ tại START +${money(scale500k(opt.obligation, mult))}.` : opt.detail } : {}),
      }))
      const optionsWithDelayed = [...scaledOptions]
      if (insured) {
        optionsWithDelayed.unshift({
          id: 'claim-insurance',
          label: 'Dùng Bảo hiểm Phòng vệ (0 ₫)',
          detail: 'Hợp đồng bảo hiểm chi trả 100% chi phí biến cố cá nhân này.',
          cost: 0,
        })
      } else if (preset.enableDelayedConsequences && event.id === 'medical') {
        const billCost = scale500k(ECONOMY.personal.medical[0], mult)
        optionsWithDelayed.push({
          id: 'buy-insurance',
          label: `Trả viện phí + Mua Bảo hiểm Phòng vệ (${money(billCost + 3_000_000)})`,
          detail: 'Đóng thêm 3.000.000 ₫ phí bảo hiểm để miễn nhiễm 100% biến cố cá nhân trong 2 vòng kế tiếp.',
          cost: billCost + 3_000_000,
          delayedEffect: 'activate-insurance',
        })
      }
      if (preset.enableDelayedConsequences && event.id === 'repair') {
        optionsWithDelayed.push({
          id: 'defer-maintenance',
          label: 'Cắt giảm chi phí bảo trì tiệm (+3.000.000 ₫)',
          detail: 'Thu hồi +3.000.000 ₫ tiền mặt ngắn hạn, nhưng hệ quả trễ làm giảm 35% dòng tiền Tiệm kinh doanh ở kỳ START tiếp theo.',
          income: 3_000_000,
          delayedEffect: 'defer-maintenance',
        })
      }
      return { ...event, options: optionsWithDelayed }
    }
    return event
  })
}
