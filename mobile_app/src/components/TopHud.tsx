import { money } from '../../../src/game/format'
import { FintechIcon } from './FintechIcon'

interface TopHudProps {
  cash: number
  debt?: number
  lawfulProceeds?: number
  currentFund?: number
  targetGoal?: number
  targetFund?: number
  chapterId?: 1 | 2 | 3
  isMuted?: boolean
  onToggleMute?: () => void
  onToggleSound?: () => void
  onHelp?: () => void
  helpDisabled?: boolean
  onHome?: () => void
  onOpenSettings?: () => void
  lap?: number
  round?: number
  totalLaps?: number
  maxRounds?: number
}

export function TopHud({
  cash,
  debt = 0,
  lawfulProceeds,
  currentFund,
  targetGoal,
  targetFund,
  chapterId = 1,
  isMuted,
  onToggleMute,
  onToggleSound,
  onHome,
  onOpenSettings,
  lap,
  round,
  totalLaps,
  maxRounds,
}: TopHudProps) {
  const currentLap = lap ?? round ?? 1
  const maxLap = totalLaps ?? maxRounds ?? 4
  const proceeds = lawfulProceeds ?? currentFund ?? 0
  const goal = targetGoal ?? targetFund ?? 90_000_000
  const progress = Math.max(0, Math.min(100, (proceeds / goal) * 100))
  const toggleAudio = onToggleMute ?? onToggleSound
  const dangerCutoff = chapterId === 3 ? 12_500_000 : chapterId === 2 ? 7_500_000 : 5_000_000
  const isDanger = cash < dangerCutoff
  const remainingLaps = Math.max(0, maxLap - currentLap)
  const netLapEstimate = chapterId === 3 ? 16_000_000 : chapterId === 2 ? 12_000_000 : 9_000_000
  const projectedProceeds = proceeds + remainingLaps * netLapEstimate

  return (
    <header
      className="mobile-hud select-none"
      style={{
        position: 'absolute',
        top: 'max(12px, env(safe-area-inset-top, 12px))',
        left: '12px',
        right: '12px',
        zIndex: 30,
        color: '#F8FAFC',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
        pointerEvents: 'auto',
        maxWidth: '420px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* ROW 1: Home/Brand — Cash Capsule — Sound & Settings */}
      <div
        className="hud-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          width: '100%',
        }}
      >
        {onHome ? (
          <button
            onClick={onHome}
            title="Quay lại Bản đồ"
            aria-label="Quay lại Bản đồ"
            className="fintech-icon-btn"
            style={{ width: '40px', height: '40px', flexShrink: 0 }}
          >
            <FintechIcon name="home" size={18} />
          </button>
        ) : (
          <div
            className="fintech-icon-btn"
            style={{ width: '40px', height: '40px', flexShrink: 0, cursor: 'default', color: '#10B981' }}
          >
            <FintechIcon name="stocks" size={18} />
          </div>
        )}

        {/* Cash Balance Pill */}
        <div
          className={`hud-cash-capsule ${isDanger ? 'hud-cash-danger-pulse' : ''}`}
          title={isDanger ? `CẢNH BÁO: Đệm tiền mặt dưới ngưỡng an toàn (${money(cash)})` : `Tiền mặt hiện có: ${money(cash)}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.84)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: isDanger ? '1px solid rgba(239, 68, 68, 0.7)' : '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '14px',
            padding: '6px 12px',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.4)',
            minWidth: 0,
            flex: '1 1 auto',
            height: '40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: isDanger ? 'rgba(239, 68, 68, 0.16)' : 'rgba(16, 185, 129, 0.16)',
                color: isDanger ? '#F87171' : '#34D399',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FintechIcon name={isDanger ? 'warning' : 'cash'} size={15} />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: isDanger ? '#FCA5A5' : '#94A3B8',
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                }}
              >
                {isDanger ? 'Đệm nguy cấp' : 'Tiền mặt'}
              </span>
              <strong
                className="tabular-nums"
                style={{
                  fontSize: '13.5px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                {money(cash)}
              </strong>
            </div>
          </div>

          {debt > 0 && (
            <div
              title={`Nợ hiện tại: ${money(debt)}`}
              className="tabular-nums"
              style={{
                background: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                borderRadius: '8px',
                padding: '2px 7px',
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#FCA5A5',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Nợ -{money(debt)}
            </div>
          )}
        </div>

        {/* Audio & Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {toggleAudio && (
            <button
              onClick={toggleAudio}
              className="fintech-icon-btn"
              aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              style={{ width: '40px', height: '40px', color: isMuted ? '#94A3B8' : '#F8FAFC' }}
            >
              <FintechIcon name={isMuted ? 'soundOff' : 'soundOn'} size={18} />
            </button>
          )}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="fintech-icon-btn"
              aria-label="Cài đặt"
              title="Cài đặt"
              style={{ width: '40px', height: '40px' }}
            >
              <FintechIcon name="settings" size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ROW 2: Chapter/Round Pill & Goal Progress Pill */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            width: '100%',
          }}
        >
          <div
            className="hud-round-section"
            data-testid="hud-sectionplay"
            title={`Chương ${chapterId} — Vòng ${currentLap} / ${maxLap}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: '10px',
              padding: '4px 10px',
              flexShrink: 0,
            }}
          >
            <FintechIcon name="round" size={13} color="#38BDF8" />
            <span
              className="tabular-nums"
              style={{
                fontWeight: 700,
                fontSize: '11px',
                color: '#E2E8F0',
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
              }}
            >
              CH{chapterId} · VÒNG {String(currentLap).padStart(2, '0')}/{String(maxLap).padStart(2, '0')}
            </span>
          </div>

          <div
            className="hud-goal"
            title={`Tiến độ huy động hợp lệ: ${(proceeds / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M / ${goal / 1_000_000}M`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '10px',
              padding: '4px 10px',
              minWidth: 0,
            }}
          >
            <FintechIcon name="goal" size={13} color="#FBBF24" />
            <span style={{ color: '#CBD5E1', fontWeight: 600, fontSize: '11px', whiteSpace: 'nowrap' }}>
              Mục tiêu
            </span>
            <strong
              className="tabular-nums"
              style={{
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '11.5px',
                whiteSpace: 'nowrap',
              }}
            >
              {(proceeds / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}/{goal / 1_000_000}M
            </strong>
            {currentLap >= 2 && (
              <span
                title={`Dự phóng cuối màn: ${(projectedProceeds / 1_000_000).toFixed(0)}M`}
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '6px',
                  background: proceeds >= goal ? 'rgba(16, 185, 129, 0.22)' : 'rgba(56, 189, 248, 0.16)',
                  color: proceeds >= goal ? '#34D399' : '#7DD3FC',
                  border: proceeds >= goal ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(56, 189, 248, 0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {proceeds >= goal ? 'ĐẠT' : `~${(projectedProceeds / 1_000_000).toFixed(0)}M`}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '5px',
            background: 'rgba(15, 23, 42, 0.78)',
            borderRadius: '999px',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: proceeds >= goal
                ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                : 'linear-gradient(90deg, #D97706 0%, #F59E0B 60%, #FBBF24 100%)',
              borderRadius: '999px',
              transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      </div>
    </header>
  )
}
