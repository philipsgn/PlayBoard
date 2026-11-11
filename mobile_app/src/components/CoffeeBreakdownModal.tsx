import React, { useState } from 'react';
import { money } from '../../../src/game/format';
import { sound } from '../utils/audio';

interface CoffeeBreakdownModalProps {
  cash: number;
  onSelectOption: (optionId: 'A' | 'B' | 'C') => void;
}

export const CoffeeBreakdownModal: React.FC<CoffeeBreakdownModalProps> = ({
  cash,
  onSelectOption,
}) => {
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | null>(null);

  React.useEffect(() => {
    sound.playCrisisAlarm();
  }, []);

  const options = [
    {
      id: 'A' as const,
      title: 'Sửa Chữa Khẩn Cấp (Gọi thợ & phụ tùng)',
      cost: 3_000_000,
      badge: 'CẦM CỜ LÊ VẶN ỐC',
      badgeColor: '#38bdf8',
      desc: 'Chi phí vừa phải. Barista dùng cờ lê xiết chặt bu lông, khói đen giảm dần. Máy vẫn là đời cũ.',
      effects: ['-3.000.000 đ Tiền mặt', '⚡ Tốc độ +15%', '☕ Khắc phục nhanh'],
    },
    {
      id: 'B' as const,
      title: 'Thay Mới Hoàn Toàn (Máy pha Inox Ý Pro)',
      cost: 20_000_000,
      badge: 'MÁY INOX MỚI 100%',
      badgeColor: '#fbbf24',
      desc: 'Khoản đầu tư tài sản Capex lớn. Máy pha mới sáng bóng, chiết xuất cà phê hoàn hảo, khách hàng vỗ tay tán thưởng.',
      effects: ['-20.000.000 đ Tiền mặt', '💎 +20M Tài sản thiết bị', '⭐ +15% Hài lòng', '⚡ +25% Tốc độ'],
    },
    {
      id: 'C' as const,
      title: 'Tự Mày Mò Sửa (Tiết kiệm ngân sách)',
      cost: 500_000,
      badge: 'TIẾT KIỆM TỐI ĐA',
      badgeColor: '#ef4444',
      desc: 'Chỉ tốn ít tiền mua keo & ốc vít nhưng mất nửa ngày mày mò, khách bỏ đi vì chờ đợi quá lâu.',
      effects: ['-500.000 đ Tiền mặt', '⚠️ -10 Ly/ngày', '⚠️ -15% Hài lòng'],
    },
  ];

  const handleConfirm = () => {
    if (!selected) return;
    sound.playCoin();
    onSelectOption(selected);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
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
          maxWidth: '430px',
          backgroundColor: '#1c1917',
          borderRadius: '24px',
          border: '2px solid #f97316',
          boxShadow: '0 20px 50px rgba(249, 115, 22, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            background: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
            color: '#ffffff',
            textAlign: 'center',
            padding: '10px 16px',
            fontSize: '12px',
            fontWeight: 900,
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>💨</span>
          <span>THE BREAKDOWN: MÁY PHA CAFE BỐC KHÓI</span>
          <span>⚙️</span>
        </div>

        {/* Content Body */}
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 900, color: '#fef3c7' }}>
              Sự Cố Hư Hỏng Thiết Bị Đột Xuất!
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#d6d3d1', lineHeight: 1.5 }}>
              Máy pha espresso áp suất cao đột ngột rò rỉ van hơi, bốc khói đen mù mịt ngay giữa giờ khách đông!
              Hãy chọn phương án ứng phó tài chính để bảo toàn doanh thu và trải nghiệm khách hàng:
            </p>
          </div>

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {options.map((opt) => {
              const isSelected = selected === opt.id;
              const canAfford = cash >= opt.cost;

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (canAfford) {
                      sound.playClick();
                      setSelected(opt.id);
                    }
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '16px',
                    backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.15)' : '#292524',
                    border: isSelected
                      ? '2px solid #f97316'
                      : '1.5px solid rgba(255, 255, 255, 0.1)',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    opacity: canAfford ? 1 : 0.45,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          background: isSelected ? '#f97316' : '#44403c',
                          color: '#ffffff',
                          borderRadius: '8px',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 900,
                        }}
                      >
                        {opt.id}
                      </span>
                      <strong style={{ fontSize: '13px', color: '#ffffff' }}>
                        {opt.title} ({money(opt.cost)})
                      </strong>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: opt.badgeColor,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        padding: '2px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {opt.badge}
                    </span>
                  </div>

                  <p style={{ margin: '4px 0 8px 0', fontSize: '11.5px', color: '#a8a29e', lineHeight: 1.4 }}>
                    {opt.desc}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {opt.effects.map((eff, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          backgroundColor: '#1c1917',
                          color: eff.includes('-') ? '#f87171' : '#34d399',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {eff}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <button
            onClick={handleConfirm}
            disabled={!selected}
            style={{
              marginTop: '4px',
              padding: '14px 20px',
              backgroundColor: selected ? '#f97316' : '#57534e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 900,
              cursor: selected ? 'pointer' : 'not-allowed',
              boxShadow: selected ? '0 4px 16px rgba(249, 115, 22, 0.4)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {selected
              ? `Xác Nhận Quyết Định (${selected})`
              : 'Hãy Chọn 1 Phương Án Xử Lý'}
          </button>
        </div>
      </div>
    </div>
  );
};
