import React from 'react'
import { sound } from '../utils/audio'
import { FintechIcon } from './FintechIcon'

export interface GamifiedModalProps {
  title?: string
  titleIcon?: string
  badgeText?: string
  lap?: number
  onClose?: () => void
  onHelp?: () => void
  primaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  children: React.ReactNode
  className?: string
}

const getAccentColor = (lap?: number, badgeText?: string): string => {
  let detectedLap = lap
  if (!detectedLap && badgeText) {
    const match = badgeText.match(/VÒNG\s*(\d)/i)
    if (match) detectedLap = parseInt(match[1], 10)
  }
  switch (detectedLap) {
    case 1: return '#10B981'
    case 2: return '#0EA5E9'
    case 3: return '#8B5CF6'
    case 4: return '#F59E0B'
    case 5: return '#EF4444'
    default: return '#10B981'
  }
}

export const GamifiedModal: React.FC<GamifiedModalProps> = ({
  title,
  badgeText,
  lap,
  onClose,
  onHelp,
  primaryAction,
  secondaryAction,
  children,
  className = '',
}) => {
  const accent = getAccentColor(lap, badgeText)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        background: 'rgba(2, 6, 23, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        fontFamily: 'var(--font-sans)',
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          sound.playClick()
          onClose()
        }
      }}
    >
      <div
        className={`relative w-full max-w-[410px] mx-auto flex flex-col ${className}`}
        style={{
          position: 'relative',
          width: 'min(93vw, 410px)',
          maxHeight: '86dvh',
          background: '#FFFFFF',
          borderRadius: '22px',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          boxShadow: '0 24px 60px rgba(2, 6, 23, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#0F172A',
        }}
      >
        {/* Top Accent Line */}
        <div style={{ height: '4px', width: '100%', background: accent, flexShrink: 0 }} />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px 10px 16px',
            borderBottom: '1px solid #F1F5F9',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            {badgeText && (
              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: accent,
                  marginBottom: '2px',
                }}
              >
                {badgeText}
              </div>
            )}
            {title && (
              <h2
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#0F172A',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </h2>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {onHelp && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  onHelp()
                }}
                aria-label="Hướng dẫn"
                title="Hướng dẫn"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  color: '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <FintechIcon name="help" size={17} />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  onClose()
                }}
                aria-label="Đóng"
                title="Đóng"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  color: '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <FintechIcon name="close" size={17} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {(primaryAction || secondaryAction) && (
          <div
            style={{
              flexShrink: 0,
              padding: '12px 16px 14px 16px',
              borderTop: '1px solid #F1F5F9',
              background: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {primaryAction && (
              <button
                type="button"
                disabled={primaryAction.disabled}
                onClick={() => {
                  sound.playClick()
                  primaryAction.onClick()
                }}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '12px',
                  border: 'none',
                  background: primaryAction.disabled ? '#CBD5E1' : '#0F172A',
                  color: primaryAction.disabled ? '#64748B' : '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: primaryAction.disabled ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.12s ease',
                }}
              >
                {primaryAction.label}
              </button>
            )}
            {secondaryAction && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  secondaryAction.onClick()
                }}
                style={{
                  width: '100%',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
