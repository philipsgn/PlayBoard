import React, { useEffect, useState } from 'react';
import type { MonthlyPnLStatement } from '../../../src/game/chapter2/types.ts';
import { money } from '../../../src/game/format.ts';
import { sound } from '../utils/audio.ts';

interface CoffeeReceiptModalProps {
  pnl: MonthlyPnLStatement;
  month: number;
  dailyCupsSold: number;
  fixedCostsBreakdown: {
    rent: number;
    labor: number;
    utilities: number;
    equipmentDepreciation: number;
    equipmentRental: number;
  };
  onContinue: () => void;
}

export const CoffeeReceiptModal: React.FC<CoffeeReceiptModalProps> = ({
  pnl,
  month,
  dailyCupsSold,
  fixedCostsBreakdown,
  onContinue,
}) => {
  const [revealedLines, setRevealedLines] = useState(0);

  useEffect(() => {
    sound.playReceiptPrint();

    // Hiệu ứng in từng dòng số liệu (7 dòng lần lượt trượt ra mỗi 140ms)
    const interval = setInterval(() => {
      setRevealedLines((prev) => {
        if (prev < 8) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 140);

    return () => clearInterval(interval);
  }, [month]);

  const isProfitable = pnl.netProfit >= 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(10, 15, 29, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        boxSizing: 'border-box',
        fontFamily: "'Fredoka', sans-serif",
      }}
    >
      {/* Bảng Kẹp Bill Gỗ Sồi Sẫm (Wooden Clipboard) */}
      <div
        className="wooden-clipboard w-full max-w-[390px] mx-auto select-none"
        style={{
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Kẹp Kim Loại Mạ Đồng Cổ Điển */}
        <div className="wooden-clip" />

        {/* Tờ Hóa Đơn Nhiệt Màu Kem (Receipt Paper) */}
        <div
          className="receipt-paper w-full overflow-y-auto medieval-scrollbar"
          style={{
            maxHeight: 'calc(90vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Header Bill */}
          <div
            style={{
              textAlign: 'center',
              borderBottom: '2px dashed #94a3b8',
              paddingBottom: '10px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, letterSpacing: '1px' }}>
              PLAYBOARD COFFEEHOUSE • CHI NHÁNH 01
            </div>
            <h2
              style={{
                margin: '2px 0 0 0',
                fontSize: '18px',
                fontWeight: 900,
                color: '#1e293b',
                letterSpacing: '0.5px',
              }}
            >
              KẾT TOÁN P&L THÁNG {month}
            </h2>
            <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>
              Kỳ báo cáo 30 ngày • 2026 Financial Standard
            </div>
          </div>

          {/* Dòng 1: Doanh Thu Bán Hàng */}
          {revealedLines >= 1 && (
            <div
              className="receipt-line-reveal"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13.5px',
                fontWeight: 800,
                color: '#1e293b',
              }}
            >
              <span>1. Doanh thu ({dailyCupsSold} ly/ngày):</span>
              <strong style={{ color: '#059669' }}>+{money(pnl.revenue)}</strong>
            </div>
          )}

          {/* Dòng 2: Giá Vốn COGS */}
          {revealedLines >= 2 && (
            <div
              className="receipt-line-reveal"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                color: '#475569',
                paddingLeft: '8px',
              }}
            >
              <span>- Giá vốn hàng bán (COGS):</span>
              <span style={{ color: '#dc2626' }}>-{money(pnl.cogs)}</span>
            </div>
          )}

          {/* Dòng 3: Lợi Nhuận Gộp */}
          {revealedLines >= 3 && (
            <div
              className="receipt-line-reveal"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13.5px',
                fontWeight: 800,
                color: '#0369a1',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '4px',
              }}
            >
              <span>= Lợi Nhuận Gộp:</span>
              <span>{money(pnl.grossProfit)}</span>
            </div>
          )}

          {/* Dòng 4: Chi Tiết Định Phí Hoạt Động */}
          {revealedLines >= 4 && (
            <div
              className="receipt-line-reveal"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '6px 8px',
                border: '1px solid #e2e8f0',
                fontSize: '11.5px',
                color: '#64748b',
              }}
            >
              <div style={{ fontWeight: 800, color: '#334155', marginBottom: '2px' }}>
                Chi tiết Định phí hoạt động: -{money(pnl.fixedCosts)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Thuê mặt bằng:</span>
                <span>{money(fixedCostsBreakdown.rent)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Lương nhân sự:</span>
                <span>{money(fixedCostsBreakdown.labor)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Điện nước internet:</span>
                <span>{money(fixedCostsBreakdown.utilities)}</span>
              </div>
              {(fixedCostsBreakdown.equipmentDepreciation > 0 || fixedCostsBreakdown.equipmentRental > 0) && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>• Khấu hao / Thuê máy:</span>
                  <span>
                    {money(fixedCostsBreakdown.equipmentDepreciation + fixedCostsBreakdown.equipmentRental)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Dòng 5: Lợi Nhuận Ròng (Net Profit) */}
          {revealedLines >= 5 && (
            <div
              className="receipt-line-reveal"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                background: isProfitable ? '#dcfce7' : '#fee2e2',
                borderRadius: '10px',
                border: `1.5px solid ${isProfitable ? '#16a34a' : '#ef4444'}`,
                marginTop: '4px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: isProfitable ? '#15803d' : '#b91c1c',
                    textTransform: 'uppercase',
                  }}
                >
                  LỢI NHUẬN RÒNG THÁNG {month}
                </span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>
                  {isProfitable ? 'Quán hoạt động có lãi' : 'Quán chịu lỗ vận hành'}
                </span>
              </div>
              <strong
                style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  color: isProfitable ? '#15803d' : '#b91c1c',
                }}
              >
                {isProfitable ? '+' : ''}
                {money(pnl.netProfit)}
              </strong>
            </div>
          )}

          {/* Dòng 6: Thước Đo Điểm Hòa Vốn (Break-even Indicator) */}
          {revealedLines >= 6 && (
            <div
              className="receipt-line-reveal"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '11.5px',
              }}
            >
              <span>Điểm hòa vốn:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ color: pnl.isBreakEven ? '#15803d' : '#ea580c' }}>
                  {dailyCupsSold} / {pnl.breakEvenCupsDaily} ly/ngày
                </strong>
                <span
                  style={{
                    background: pnl.isBreakEven ? '#22c55e' : '#f97316',
                    color: '#ffffff',
                    borderRadius: '999px',
                    padding: '1px 6px',
                    fontSize: '9.5px',
                    fontWeight: 800,
                  }}
                >
                  {pnl.isBreakEven ? 'HÒA VỐN' : 'CHƯA ĐẠT'}
                </span>
              </div>
            </div>
          )}

          {/* Dòng 7: Tiền Mặt Lưu Động Cuối Kỳ */}
          {revealedLines >= 7 && (
            <div
              className="receipt-line-reveal"
              style={{
                borderTop: '2px dashed #94a3b8',
                paddingTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px',
                fontWeight: 800,
              }}
            >
              <span style={{ color: '#475569' }}>Tiền mặt lưu động còn lại:</span>
              <strong style={{ fontSize: '15px', color: pnl.cashEnding < 10_000_000 ? '#dc2626' : '#059669' }}>
                {money(pnl.cashEnding)}
              </strong>
            </div>
          )}

          {/* Nút Tiếp Tục */}
          {revealedLines >= 8 && (
            <div style={{ marginTop: '12px' }}>
              <button
                onClick={() => {
                  sound.playCashDrawer();
                  onContinue();
                }}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  background: 'linear-gradient(180deg, #b45309 0%, #78350f 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #451a03, 0 6px 16px rgba(0,0,0,0.3)',
                  transition: 'transform 0.1s ease',
                }}
                onPointerDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(2px)';
                }}
                onPointerUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {month < 3 ? `Tiếp Tục Sang Tháng ${month + 1} ➔` : 'Xem Kết Quả Chung Cuộc 🏆'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
