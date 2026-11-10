import React, { useState } from 'react';
import type { DrinkOrder } from '../../../src/game/chapter2/types';
import type { BaristaStation } from './CoffeeShop3DView';
import { sound } from '../utils/audio';

interface CoffeeWorkShift3DOverlayProps {
  orders: DrinkOrder[];
  onCompleteOrder: (orderId: string, success: boolean, tip: number) => void;
  onStationSelect: (station: BaristaStation | null) => void;
  onFinishShift: () => void;
}

export const CoffeeWorkShift3DOverlay: React.FC<CoffeeWorkShift3DOverlayProps> = ({
  orders,
  onCompleteOrder,
  onStationSelect,
  onFinishShift,
}) => {
  const currentOrder = orders[0];
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1); // 1: Grind, 2: Extract, 3: Milk/Flavor, 4: Ready to Serve
  const [lastTip, setLastTip] = useState<number | null>(null);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const handleGrind = () => {
    sound.playClick();
    onStationSelect('grind');
    setCurrentStep(2);
  };

  const handleExtract = () => {
    sound.playClick();
    onStationSelect('extract');
    setCurrentStep(3);
  };

  const handleMilk = () => {
    sound.playClick();
    onStationSelect('milk');
    setCurrentStep(4);
  };

  const handleServe = () => {
    if (!currentOrder) return;
    const earnedTip = currentOrder.tipPotential;
    sound.playCoin();
    onStationSelect(null);
    setLastTip(earnedTip);

    setTimeout(() => {
      onCompleteOrder(currentOrder.id, true, earnedTip);
      setCurrentStep(1);
      setLastTip(null);
    }, 600);
  };

  if (!currentOrder) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#1e1109',
          borderRadius: '20px',
          border: '2px solid #10b981',
          padding: '20px',
          textAlign: 'center',
          color: '#fde68a',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)',
          fontFamily: "'Fredoka', sans-serif",
        }}
      >
        <div style={{ fontSize: '36px' }}>🎉</div>
        <h3 style={{ margin: '8px 0', fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
          HOÀN THÀNH XUẤT SẮC CA TRỰC!
        </h3>
        <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.4, margin: '8px 0 16px 0' }}>
          Tất cả khách hàng đã được phục vụ với chất lượng tốt nhất. Doanh thu và tiền tip đã được cộng vào két sắt quán!
        </p>
        <button
          onClick={() => {
            sound.playClick();
            onFinishShift();
          }}
          style={{
            padding: '12px 28px',
            backgroundColor: '#10b981',
            color: '#064e3b',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          }}
        >
          XEM BẢNG P&L KẾT TOÁN THÁNG ➔
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#1e1109',
        borderRadius: '20px',
        border: '2px solid #b45309',
        padding: '14px 16px',
        color: '#fef3c7',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.75)',
        fontFamily: "'Fredoka', sans-serif",
      }}
    >
      {/* 1. ORDER TICKET HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
          paddingBottom: '8px',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>{currentOrder.icon}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
              {currentOrder.drinkName}
            </div>
            <div style={{ fontSize: '11px', color: '#f59e0b' }}>
              Khách hàng: <strong>{currentOrder.customerName}</strong> • Còn lại: {orders.length} đơn
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#34d399' }}>
            +{formatVND(currentOrder.price)}
          </div>
          <div style={{ fontSize: '10px', color: '#fcd34d' }}>
            Tip tối đa +{formatVND(currentOrder.tipPotential)}
          </div>
        </div>
      </div>

      {/* 2. THREE-STEP TACTILE CRAFTING BAR */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        {/* Bước 1: Xay hạt */}
        <button
          onClick={handleGrind}
          disabled={currentStep !== 1}
          style={{
            flex: 1,
            padding: '10px 4px',
            borderRadius: '12px',
            border: currentStep === 1 ? '2px solid #38bdf8' : '1px solid rgba(245, 158, 11, 0.2)',
            backgroundColor: currentStep > 1 ? '#064e3b' : currentStep === 1 ? '#b45309' : '#26140b',
            color: currentStep > 1 ? '#6ee7b7' : '#ffffff',
            fontWeight: 800,
            fontSize: '11px',
            cursor: currentStep === 1 ? 'pointer' : 'default',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            transition: 'all 0.2s',
          }}
        >
          <span>1. XAY HẠT</span>
          <span style={{ fontSize: '9px', opacity: 0.8 }}>
            {currentOrder.recipe.beanType === 'robusta' ? 'Robusta' : 'Arabica'}
          </span>
          {currentStep > 1 && <span>✓</span>}
        </button>

        {/* Bước 2: Chiết xuất */}
        <button
          onClick={handleExtract}
          disabled={currentStep !== 2}
          style={{
            flex: 1,
            padding: '10px 4px',
            borderRadius: '12px',
            border: currentStep === 2 ? '2px solid #38bdf8' : '1px solid rgba(245, 158, 11, 0.2)',
            backgroundColor: currentStep > 2 ? '#064e3b' : currentStep === 2 ? '#b45309' : '#26140b',
            color: currentStep > 2 ? '#6ee7b7' : '#ffffff',
            fontWeight: 800,
            fontSize: '11px',
            cursor: currentStep === 2 ? 'pointer' : 'default',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            transition: 'all 0.2s',
          }}
        >
          <span>2. CHIẾT XUẤT</span>
          <span style={{ fontSize: '9px', opacity: 0.8 }}>Áp suất 9 bar</span>
          {currentStep > 2 && <span>✓</span>}
        </button>

        {/* Bước 3: Rót sữa & Đá */}
        <button
          onClick={handleMilk}
          disabled={currentStep !== 3}
          style={{
            flex: 1,
            padding: '10px 4px',
            borderRadius: '12px',
            border: currentStep === 3 ? '2px solid #38bdf8' : '1px solid rgba(245, 158, 11, 0.2)',
            backgroundColor: currentStep > 3 ? '#064e3b' : currentStep === 3 ? '#b45309' : '#26140b',
            color: currentStep > 3 ? '#6ee7b7' : '#ffffff',
            fontWeight: 800,
            fontSize: '11px',
            cursor: currentStep === 3 ? 'pointer' : 'default',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            transition: 'all 0.2s',
          }}
        >
          <span>3. SỮA & ĐÁ</span>
          <span style={{ fontSize: '9px', opacity: 0.8 }}>Đánh bọt mịn</span>
          {currentStep > 3 && <span>✓</span>}
        </button>
      </div>

      {/* 3. SERVE BUTTON */}
      {currentStep === 4 && (
        <button
          onClick={handleServe}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#10b981',
            color: '#064e3b',
            border: 'none',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            animation: 'pulse 1.2s infinite',
          }}
        >
          <span>☕ PHỤC VỤ KHÁCH HÀNG NGAY! ➔</span>
        </button>
      )}

      {/* Tip Feedback Popup */}
      {lastTip !== null && (
        <div
          style={{
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 800,
            color: '#fcd34d',
            marginTop: '8px',
          }}
        >
          ✨ Nhận được +{formatVND(lastTip)} Tiền Tip từ {currentOrder.customerName}!
        </div>
      )}
    </div>
  );
};
