import React from 'react';
import { sound } from '../utils/audio';
import { FintechIcon } from './FintechIcon';

export interface BottomControlsProps {
  onRollClick?: () => void;
  onBagClick?: () => void;
  onPortfolioClick?: () => void;
  onGuideClick?: () => void;
  onLogClick?: () => void;
  lastDiceValue?: number;
  disabled?: boolean;
  onRollDice?: () => void;
  canRoll?: boolean;
  isRolling?: boolean;
  onOpenBag?: () => void;
  onOpenGuide?: () => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  onRollClick,
  onBagClick,
  onPortfolioClick,
  onGuideClick,
  onLogClick,
  lastDiceValue,
  disabled,
  onRollDice,
  canRoll,
  isRolling,
  onOpenBag,
  onOpenGuide,
}) => {
  const handleBag = onOpenBag || onBagClick || onPortfolioClick || (() => {});
  const handleGuide = onOpenGuide || onGuideClick || onLogClick || (() => {});
  const handleRoll = onRollDice || onRollClick || (() => {});

  const isDisabled =
    disabled !== undefined
      ? disabled
      : (canRoll !== undefined ? !canRoll : false) || (isRolling ?? false);

  const onBagPress = () => {
    sound.playClick();
    sound.triggerHaptic('light');
    handleBag();
  };

  const onGuidePress = () => {
    sound.playClick();
    sound.triggerHaptic('light');
    handleGuide();
  };

  const onRollPress = () => {
    if (isDisabled) return;
    sound.playDiceRoll();
    sound.triggerHaptic('medium');
    handleRoll();
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
        boxSizing: 'border-box',
        padding: '0 12px max(12px, env(safe-area-inset-bottom, 12px)) 12px',
        gap: '8px',
      }}
    >
      {lastDiceValue && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            borderRadius: '999px',
            padding: '4px 12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }}
        >
          <FintechIcon name="dice" size={14} color="#FBBF24" />
          <span
            className="tabular-nums"
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#FEF3C7',
              lineHeight: 1,
            }}
          >
            Bước {lastDiceValue}
          </span>
        </div>
      )}

      {/* Fintech Bottom Action Bar */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          pointerEvents: 'auto',
        }}
      >
        {/* Left: Danh mục Tài sản */}
        <button
          onClick={onBagPress}
          title="Danh mục Tài sản & Nhật ký"
          aria-label="Tài sản"
          className="fintech-icon-btn"
          style={{
            height: '52px',
            minWidth: '88px',
            padding: '0 14px',
            gap: '7px',
            borderRadius: '16px',
            flexShrink: 0,
          }}
        >
          <FintechIcon name="portfolio" size={18} color="#38BDF8" />
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#F1F5F9', whiteSpace: 'nowrap' }}>
            Tài sản
          </span>
        </button>

        {/* Center: Primary Roll CTA */}
        <button
          onClick={onRollPress}
          disabled={isDisabled}
          title={isDisabled ? 'Đang thực hiện lượt...' : 'Chạm để Gieo Xúc Xắc'}
          aria-label="Lắc Xúc Xắc"
          style={{
            flex: 1,
            height: '56px',
            borderRadius: '18px',
            border: isDisabled ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(52, 211, 153, 0.65)',
            background: isDisabled
              ? 'rgba(30, 41, 59, 0.78)'
              : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '9px',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.6 : 1,
            boxShadow: isDisabled
              ? '0 4px 12px rgba(0, 0, 0, 0.3)'
              : '0 8px 24px rgba(16, 185, 129, 0.42), inset 0 1px 0 rgba(255,255,255,0.25)',
            transition: 'transform 0.14s ease, opacity 0.15s ease',
          }}
          onPointerDown={(e) => {
            if (!isDisabled) e.currentTarget.style.transform = 'scale(0.96)';
          }}
          onPointerUp={(e) => {
            if (!isDisabled) e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FintechIcon name="dice" size={22} color="#FFFFFF" />
          <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
            {isDisabled ? 'Đang xử lý...' : 'Gieo Xúc Xắc'}
          </span>
        </button>

        {/* Right: Luật chơi / Kiến thức */}
        <button
          onClick={onGuidePress}
          title="Sổ Tay Chiến Lược & Luật Chơi"
          aria-label="Sổ Tay"
          className="fintech-icon-btn"
          style={{
            height: '52px',
            minWidth: '88px',
            padding: '0 14px',
            gap: '7px',
            borderRadius: '16px',
            flexShrink: 0,
          }}
        >
          <FintechIcon name="guide" size={18} color="#FBBF24" />
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#F1F5F9', whiteSpace: 'nowrap' }}>
            Sổ tay
          </span>
        </button>
      </div>
    </div>
  );
};
