import React, { useState } from 'react';
import type { DecisionCard, DecisionOption } from '../../../src/game/chapter2/types.ts';
import { money } from '../../../src/game/format.ts';
import { sound } from '../utils/audio.ts';

interface CoffeeDecisionCardProps {
  card: DecisionCard;
  month: number;
  order: number;
  cash: number;
  onSelectOption: (optionId: 'A' | 'B' | 'C') => void;
}

export const CoffeeDecisionCard: React.FC<CoffeeDecisionCardProps> = ({
  card,
  month,
  order,
  cash,
  onSelectOption,
}) => {
  const [selectedOption, setSelectedOption] = useState<DecisionOption | null>(null);
  const [showTakeaway, setShowTakeaway] = useState(false);

  const handleChoose = (opt: DecisionOption) => {
    sound.playClick();
    setSelectedOption(opt);
    setShowTakeaway(true);
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    sound.playEspressoMachine();
    onSelectOption(selectedOption.id);
    setSelectedOption(null);
    setShowTakeaway(false);
  };

  return (
    <div
      className="polaroid-card w-full max-w-[390px] mx-auto select-none"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        fontFamily: "'Fredoka', sans-serif",
      }}
    >
      {/* Header Thẻ: Huy hiệu Tháng & Thứ tự thẻ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1.5px dashed #cbd5e1',
          paddingBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              background: '#78350f',
              color: '#fef3c7',
              borderRadius: '999px',
              padding: '2px 10px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.5px',
            }}
          >
            THÁNG {month} • TÌNH HUỐNG {order}/4
          </span>
          <span
            style={{
              background: '#fef3c7',
              color: '#92400e',
              borderRadius: '999px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
          >
            {card.category}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
          Quỹ: <strong style={{ color: cash < 5_000_000 ? '#ef4444' : '#059669' }}>{money(cash)}</strong>
        </span>
      </div>

      {/* Bối Cảnh Tình Huống */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: 800,
            color: '#451a03',
            lineHeight: 1.25,
          }}
        >
          {card.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '12.5px',
            color: '#475569',
            lineHeight: 1.45,
            fontWeight: 500,
          }}
        >
          {card.context}
        </p>
      </div>

      {/* 3 Lựa Chọn Quyết Định A / B / C */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
        {card.options.map((opt) => {
          const isSelected = selectedOption?.id === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleChoose(opt)}
              className="tactile-option-btn"
              style={{
                borderColor: isSelected ? '#d97706' : undefined,
                background: isSelected ? '#fef3c7' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '8px',
                    background: isSelected ? '#b45309' : '#e2e8f0',
                    color: isSelected ? '#ffffff' : '#334155',
                    fontSize: '12px',
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {opt.id}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#1e293b',
                      lineHeight: 1.35,
                    }}
                  >
                    {opt.label}
                  </div>

                  {/* Financial Impact Tags */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      marginTop: '5px',
                    }}
                  >
                    {opt.cashImpactImmediate !== 0 && (
                      <span
                        style={{
                          background: opt.cashImpactImmediate < 0 ? '#fee2e2' : '#dcfce7',
                          color: opt.cashImpactImmediate < 0 ? '#b91c1c' : '#15803d',
                          borderRadius: '6px',
                          padding: '1px 6px',
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        {opt.cashImpactImmediate < 0 ? 'Chi ngay ' : '+'}
                        {money(Math.abs(opt.cashImpactImmediate))}
                      </span>
                    )}

                    {opt.dailyCupsDelta !== 0 && (
                      <span
                        style={{
                          background: opt.dailyCupsDelta > 0 ? '#e0f2fe' : '#f1f5f9',
                          color: opt.dailyCupsDelta > 0 ? '#0369a1' : '#475569',
                          borderRadius: '6px',
                          padding: '1px 6px',
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        ☕ {opt.dailyCupsDelta > 0 ? `+${opt.dailyCupsDelta}` : opt.dailyCupsDelta} ly/ngày
                      </span>
                    )}

                    {opt.fixedCostDelta?.rent !== undefined && opt.fixedCostDelta.rent > 0 && (
                      <span
                        style={{
                          background: '#ffedd5',
                          color: '#c2410c',
                          borderRadius: '6px',
                          padding: '1px 6px',
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        Thuê: {money(opt.fixedCostDelta.rent)}/tháng
                      </span>
                    )}

                    {opt.fixedCostDelta?.labor !== undefined && opt.fixedCostDelta.labor > 0 && (
                      <span
                        style={{
                          background: '#fef3c7',
                          color: '#b45309',
                          borderRadius: '6px',
                          padding: '1px 6px',
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        Lương: {money(opt.fixedCostDelta.labor)}/tháng
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal / Hộp Bài Học Tài Chính Thực Tế (Takeaway Lesson Popup) */}
      {showTakeaway && selectedOption && (
        <div
          style={{
            marginTop: '8px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '1.5px solid #d97706',
            borderRadius: '16px',
            padding: '12px 14px',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 800,
              color: '#92400e',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            <span>💡 Bài Học Tài Chính F&B:</span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              lineHeight: 1.45,
              color: '#78350f',
              fontWeight: 600,
            }}
          >
            {selectedOption.takeawayLesson}
          </p>

          <button
            onClick={handleConfirm}
            style={{
              marginTop: '10px',
              width: '100%',
              padding: '10px 0',
              background: 'linear-gradient(180deg, #b45309 0%, #78350f 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 4px 0 #451a03, 0 4px 12px rgba(0,0,0,0.25)',
              transition: 'transform 0.1s ease',
            }}
            onPointerDown={(e) => {
              e.currentTarget.style.transform = 'translateY(2px)';
            }}
            onPointerUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Xác Nhận Quyết Định ({selectedOption.id})
          </button>
        </div>
      )}
    </div>
  );
};
