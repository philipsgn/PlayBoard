import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../utils/audio';
import { GamifiedModal } from './GamifiedModal';
import { isAutoShowRulesEnabled, setAutoShowRulesEnabled } from '../game/rules-settings';
import { FintechIcon } from './FintechIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onRestart?: () => void;
  onHelp?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
  onRestart,
}) => {
  const [autoRules, setAutoRules] = useState(() => isAutoShowRulesEnabled());
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
    };
  }, []);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setConfirmingRestart(false);
    }
  }

  if (!isOpen) return null;

  const handleToggleSound = () => {
    sound.playClick();
    onToggleMute();
  };

  const handleToggleAutoRules = () => {
    sound.playClick();
    const next = !autoRules;
    setAutoRules(next);
    setAutoShowRulesEnabled(next);
  };

  const handleRestartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();

    if (!confirmingRestart) {
      setConfirmingRestart(true);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      restartTimerRef.current = setTimeout(() => {
        setConfirmingRestart(false);
      }, 4500);
    } else {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      setConfirmingRestart(false);
      onRestart?.();
      onClose();
    }
  };

  const handleCancelRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setConfirmingRestart(false);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
  };

  return (
    <GamifiedModal
      badgeText="HỆ THỐNG & TRẢI NGHIỆM"
      title="Cài Đặt Trò Chơi"
      onClose={onClose}
      primaryAction={{
        label: 'Hoàn tất',
        onClick: onClose,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* 1. Âm Thanh */}
        <div
          onClick={handleToggleSound}
          role="button"
          tabIndex={0}
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          style={{
            background: '#F8FAFC',
            border: isMuted ? '1px solid #E2E8F0' : '1px solid #A7F3D0',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer',
            transition: 'transform 0.14s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isMuted ? '#E2E8F0' : '#D1FAE5',
                color: isMuted ? '#475569' : '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FintechIcon name={isMuted ? 'soundOff' : 'soundOn'} size={18} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                Âm thanh & Hiệu ứng
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                {isMuted ? 'Đang tắt tiếng toàn bộ trò chơi' : 'Bật nhạc nền & hiệu ứng giao dịch'}
              </div>
            </div>
          </div>

          <div
            style={{
              width: '46px',
              height: '26px',
              borderRadius: '999px',
              background: isMuted ? '#CBD5E1' : '#10B981',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.2s ease',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                transform: isMuted ? 'translateX(0)' : 'translateX(20px)',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>
        </div>

        {/* 2. Tự động mở luật chơi */}
        <div
          onClick={handleToggleAutoRules}
          role="button"
          tabIndex={0}
          aria-label={autoRules ? 'Tắt tự động mở luật chơi' : 'Bật tự động mở luật chơi'}
          style={{
            background: '#F8FAFC',
            border: autoRules ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer',
            transition: 'transform 0.14s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: autoRules ? '#DBEAFE' : '#E2E8F0',
                color: autoRules ? '#2563EB' : '#475569',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FintechIcon name="guide" size={18} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                Tự động mở Sổ tay
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                {autoRules ? 'Hiển thị quy tắc khi bắt đầu Chương' : 'Vào thẳng bàn cờ không mở sổ tay'}
              </div>
            </div>
          </div>

          <div
            style={{
              width: '46px',
              height: '26px',
              borderRadius: '999px',
              background: autoRules ? '#2563EB' : '#CBD5E1',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.2s ease',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                transform: autoRules ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>
        </div>

        {/* 3. Bắt đầu lại ván chơi */}
        {onRestart && (
          <div
            onClick={handleRestartClick}
            role="button"
            tabIndex={0}
            aria-label="Khởi động lại ván chơi"
            style={{
              background: confirmingRestart ? '#DC2626' : '#FEF2F2',
              border: confirmingRestart ? '1px solid #F87171' : '1px solid #FECACA',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
              <span
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: confirmingRestart ? 'rgba(255,255,255,0.2)' : '#FEE2E2',
                  color: confirmingRestart ? '#FFFFFF' : '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FintechIcon name="round" size={18} />
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: confirmingRestart ? '#FFFFFF' : '#991B1B' }}>
                  {confirmingRestart ? 'Nhấn lần nữa để xác nhận!' : 'Bắt đầu lại ván mới'}
                </div>
                <div style={{ fontSize: '12px', color: confirmingRestart ? '#FEE2E2' : '#B91C1C', fontWeight: 500 }}>
                  {confirmingRestart ? 'Toàn bộ lượt đi hiện tại sẽ được làm mới' : 'Khởi tạo lại ván chơi từ đầu'}
                </div>
              </div>
            </div>

            {confirmingRestart && (
              <button
                type="button"
                onClick={handleCancelRestart}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid #FFFFFF',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Hủy
              </button>
            )}
          </div>
        )}
      </div>
    </GamifiedModal>
  );
};
