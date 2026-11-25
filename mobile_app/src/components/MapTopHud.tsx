import React from 'react';
import { sound } from '../utils/audio';
import { FintechIcon } from './FintechIcon';

interface MapTopHudProps {
  onBack?: () => void;
  onOpenSettings: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const MapTopHud: React.FC<MapTopHudProps> = ({
  onBack,
  onOpenSettings,
  isMuted = false,
  onToggleMute,
}) => {
  return (
    <div
      className="map-top-bar w-full select-none"
      style={{
        position: 'absolute',
        top: 'max(14px, env(safe-area-inset-top, 14px))',
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        zIndex: 50,
        padding: '0 14px',
        boxSizing: 'border-box',
        pointerEvents: 'auto',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        {/* Left: Back / Brand Pill */}
        <button
          type="button"
          onClick={() => {
            if (onBack) {
              sound.playClick();
              onBack();
            }
          }}
          aria-label={onBack ? 'Quay lại màn hình chính' : 'PlayBoard'}
          className="fintech-icon-btn"
          style={{
            height: '42px',
            padding: '0 14px',
            gap: '8px',
            borderRadius: '14px',
            cursor: onBack ? 'pointer' : 'default',
          }}
        >
          {onBack && <FintechIcon name="back" size={16} color="#CBD5E1" />}
          <FintechIcon name="stocks" size={17} color="#10B981" />
          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
            PlayBoard
          </span>
        </button>

        {/* Right: Sound & Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onToggleMute && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onToggleMute();
              }}
              aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className="fintech-icon-btn"
              style={{
                width: '42px',
                height: '42px',
                color: isMuted ? '#94A3B8' : '#F8FAFC',
              }}
            >
              <FintechIcon name={isMuted ? 'soundOff' : 'soundOn'} size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            aria-label="Cài đặt"
            title="Cài đặt"
            className="fintech-icon-btn"
            style={{ width: '42px', height: '42px' }}
          >
            <FintechIcon name="settings" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
