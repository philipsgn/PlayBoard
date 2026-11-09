import React, { useState } from 'react';
import type { CoffeeCrisisEvent, CrisisOption } from '../../../src/game/chapter2/types';
import { sound } from '../utils/audio';

interface CoffeeCrisisModalProps {
  crisis: CoffeeCrisisEvent;
  onSelectOption: (optionId: 'A' | 'B' | 'C') => void;
}

export const CoffeeCrisisModal: React.FC<CoffeeCrisisModalProps> = ({
  crisis,
  onSelectOption,
}) => {
  const [selectedOption, setSelectedOption] = useState<CrisisOption | null>(null);
  const [showTakeaway, setShowTakeaway] = useState(false);

  React.useEffect(() => {
    sound.playCrisisAlarm();
  }, [crisis.id]);

  const handleChooseOption = (option: CrisisOption) => {
    sound.playClick();
    setSelectedOption(option);
    setShowTakeaway(true);
  };

  const handleConfirmTakeaway = () => {
    if (!selectedOption) return;
    sound.playCoin();
    onSelectOption(selectedOption.id);
  };

  const urgencyColors = {
    critical: {
      border: '#EF4444',
      badgeBg: '#EF4444',
      badgeText: 'BÁO ĐỘNG ĐỎ: NGUY CẤP',
      glow: 'rgba(239, 68, 68, 0.4)',
    },
    high: {
      border: '#F59E0B',
      badgeBg: '#F59E0B',
      badgeText: 'CẢNH BÁO: RỦI RO CAO',
      glow: 'rgba(245, 158, 11, 0.4)',
    },
    opportunity: {
      border: '#10B981',
      badgeBg: '#10B981',
      badgeText: 'CƠ HỘI ĐỘT BIẾN',
      glow: 'rgba(16, 185, 129, 0.4)',
    },
  }[crisis.urgencyLevel];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Fredoka', sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#1E293B',
          borderRadius: '24px',
          border: `2px solid ${urgencyColors.border}`,
          boxShadow: `0 20px 40px ${urgencyColors.glow}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Banner khẩn cấp */}
        <div
          style={{
            backgroundColor: urgencyColors.badgeBg,
            color: '#FFFFFF',
            textAlign: 'center',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>🚨</span>
          <span>{urgencyColors.badgeText}</span>
          <span>🚨</span>
        </div>

        {/* Nội dung tình huống */}
        <div style={{ padding: '20px 20px 14px' }}>
          <h2
            style={{
              margin: '0 0 10px',
              fontSize: '19px',
              fontWeight: 800,
              color: '#F8FAFC',
              lineHeight: 1.3,
            }}
          >
            {crisis.title}
          </h2>

          <div
            style={{
              backgroundColor: '#0F172A',
              padding: '14px',
              borderRadius: '16px',
              border: '1px solid #334155',
              color: '#CBD5E1',
              fontSize: '14px',
              lineHeight: 1.5,
              marginBottom: '18px',
            }}
          >
            {crisis.context}
          </div>

          <div style={{ fontSize: '12.5px', color: '#94A3B8', fontWeight: 700, marginBottom: '10px' }}>
            HÃY LỰA CHỌN PHƯƠNG ÁN ỨNG BIẾN:
          </div>

          {/* 3 Lựa chọn A / B / C */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {crisis.options.map((option) => {
              return (
                <button
                  key={option.id}
                  onClick={() => handleChooseOption(option)}
                  style={{
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                  onPointerDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                    e.currentTarget.style.backgroundColor = '#475569';
                  }}
                  onPointerUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = '#334155';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        backgroundColor: '#0EA5E9',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '12px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {option.id}
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#F1F5F9', lineHeight: 1.35 }}>
                      {option.label}
                    </span>
                  </div>

                  {/* Financial Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '32px' }}>
                    {option.cashImpactImmediate !== 0 && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: option.cashImpactImmediate > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: option.cashImpactImmediate > 0 ? '#34D399' : '#F87171',
                          border: `1px solid ${option.cashImpactImmediate > 0 ? '#059669' : '#DC2626'}`,
                        }}
                      >
                        {option.cashImpactImmediate > 0 ? '+' : ''}
                        {(option.cashImpactImmediate / 1_000_000).toFixed(1)}M VND
                      </span>
                    )}

                    {option.dailyCupsDelta !== 0 && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: option.dailyCupsDelta > 0 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: option.dailyCupsDelta > 0 ? '#38BDF8' : '#FBBF24',
                          border: `1px solid ${option.dailyCupsDelta > 0 ? '#0284C7' : '#D97706'}`,
                        }}
                      >
                        {option.dailyCupsDelta > 0 ? '+' : ''}{option.dailyCupsDelta} ly/ngày
                      </span>
                    )}

                    {option.satisfactionDelta !== 0 && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: option.satisfactionDelta > 0 ? 'rgba(168, 85, 247, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                          color: option.satisfactionDelta > 0 ? '#C084FC' : '#9CA3AF',
                          border: `1px solid ${option.satisfactionDelta > 0 ? '#7E22CE' : '#4B5563'}`,
                        }}
                      >
                        {option.satisfactionDelta > 0 ? '+' : ''}{option.satisfactionDelta}% hài lòng
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popup Bài học thực chiến (Takeaway Lesson Modal) */}
      {showTakeaway && selectedOption && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#0F172A',
              border: '2px solid #F59E0B',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '380px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '38px', marginBottom: '8px' }}>💡</div>
            <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 800, color: '#FCD34D' }}>
              BÀI HỌC QUẢN TRỊ F&B
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '14px', lineHeight: 1.6, color: '#E2E8F0' }}>
              {selectedOption.takeawayLesson}
            </p>
            <button
              onClick={handleConfirmTakeaway}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Fredoka', sans-serif",
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)',
              }}
            >
              Tiếp Tục Vận Hành ☕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
