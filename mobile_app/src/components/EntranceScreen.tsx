import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { SettingsModal } from './SettingsModal';
import { assetUrl } from '../utils/assets';
import { FintechIcon } from './FintechIcon';

interface EntranceScreenProps {
  onPlay: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onRestart?: () => void;
  onHelp?: () => void;
  onOpenSettings?: () => void;
}

export const EntranceScreen: React.FC<EntranceScreenProps> = ({
  onPlay,
  isMuted = false,
  onToggleMute,
  onRestart,
  onHelp,
  onOpenSettings,
}) => {
  const [localSettingsOpen, setLocalSettingsOpen] = useState(false);

  const handlePlayClick = () => {
    try {
      sound.unlockAudio();
      sound.playClick();
      if (!sound.isMuted) sound.startBgm();
    } catch {
      // Audio failure should never block game launch
    }
    onPlay();
  };

  const handleToggleSound = () => {
    try {
      sound.playClick();
      onToggleMute?.();
    } catch {
      // Ignore
    }
  };

  const handleOpenSettings = () => {
    try {
      sound.playClick();
    } catch {
      // Ignore
    }
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      setLocalSettingsOpen(true);
    }
  };

  return (
    <div
      className="entrance-screen-root relative overflow-hidden flex flex-col items-center justify-between"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'max(20px, env(safe-area-inset-top, 20px)) 20px max(36px, env(safe-area-inset-bottom, 36px)) 20px',
        boxSizing: 'border-box',
        zIndex: 10,
        fontFamily: 'var(--font-sans)',
        userSelect: 'none',
        writingMode: 'horizontal-tb',
        pointerEvents: 'auto',
      }}
    >
      {/* Background Splash */}
      <img
        src={assetUrl('assets/splash-game.webp')}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = assetUrl('assets/splash-game.png');
        }}
        alt="PlayBoard — Cờ Tỷ Phú Tài Chính"
        className="pointer-events-none select-none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          zIndex: 0,
          userSelect: 'none',
        }}
      />

      {/* Subtle Dark Gradient Scrim for Fintech Readability */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.15) 45%, rgba(15, 23, 42, 0.85) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Top Action Bar */}
      <div
        className="pointer-events-auto relative z-50 flex items-center justify-between w-full"
        style={{
          position: 'relative',
          zIndex: 50,
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          className="fintech-icon-btn"
          style={{ height: '42px', padding: '0 14px', gap: '8px', cursor: 'default' }}
        >
          <FintechIcon name="stocks" size={18} color="#10B981" />
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#F8FAFC' }}>PlayBoard</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleToggleSound}
            className="fintech-icon-btn"
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            style={{ width: '42px', height: '42px', color: isMuted ? '#94A3B8' : '#F8FAFC' }}
          >
            <FintechIcon name={isMuted ? 'soundOff' : 'soundOn'} size={18} />
          </button>

          <button
            type="button"
            onClick={handleOpenSettings}
            className="fintech-icon-btn"
            aria-label="Mở Cài Đặt"
            title="Mở Cài Đặt"
            style={{ width: '42px', height: '42px' }}
          >
            <FintechIcon name="settings" size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Fintech Hero Card & Primary CTA */}
      <div
        className="pointer-events-auto relative z-50 flex flex-col items-center w-full"
        style={{
          position: 'relative',
          zIndex: 50,
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <div
          style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.84)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '20px',
            padding: '18px 20px',
            textAlign: 'center',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.55)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.16)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34D399',
              fontSize: '11px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            <FintechIcon name="layers" size={13} />
            <span>3 CHƯƠNG BÀN CỜ ĐẦU TƯ TÀI CHÍNH</span>
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.25,
              marginBottom: '6px',
              letterSpacing: '-0.02em',
            }}
          >
            Làm Chủ Dòng Tiền & Danh Mục
          </h1>
          <p
            style={{
              fontSize: '12.5px',
              fontWeight: 500,
              color: '#CBD5E1',
              lineHeight: 1.45,
            }}
          >
            Từ 50 triệu đến tự do tài chính 360 triệu qua 3 chương chiến lược: thanh khoản, rủi ro tín dụng, lạm phát và đòn bẩy Call Margin.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePlayClick}
          aria-label="Bắt đầu phiêu lưu"
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '16px',
            border: '1px solid rgba(52, 211, 153, 0.65)',
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 800,
            letterSpacing: '0.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 10px 26px rgba(16, 185, 129, 0.42), inset 0 1px 0 rgba(255,255,255,0.25)',
            transition: 'transform 0.14s ease',
          }}
          onPointerDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.97)';
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FintechIcon name="map" size={20} color="#FFFFFF" />
          <span>Vào Bản Đồ Hành Trình</span>
        </button>
      </div>

      {!onOpenSettings && (
        <SettingsModal
          isOpen={localSettingsOpen}
          onClose={() => setLocalSettingsOpen(false)}
          isMuted={isMuted}
          onToggleMute={onToggleMute || (() => {})}
          onRestart={onRestart}
          onHelp={onHelp}
        />
      )}
    </div>
  );
};
