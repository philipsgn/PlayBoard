import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';

export type CustomerEmotion = 'idle' | 'happy' | 'anxious' | 'tipping';

interface ChibiCustomerBarProps {
  emotion?: CustomerEmotion;
  satisfaction: number;
  tipAccumulated: number;
  dailyCups: number;
}

const DRINK_ORDERS = [
  { icon: '☕', name: 'Bạc Xỉu Sữa Đặc' },
  { icon: '🧊', name: 'Cold Brew Cam Sả' },
  { icon: '🍵', name: 'Matcha Latte Đá' },
  { icon: '🥐', name: 'Cà Phê & Croissant' },
];

export const ChibiCustomerBar: React.FC<ChibiCustomerBarProps> = ({
  emotion = 'idle',
  satisfaction,
  tipAccumulated,
  dailyCups,
}) => {
  const [orderIndex, setOrderIndex] = useState(0);
  const [isJingling, setIsJingling] = useState(false);

  // Chu kỳ đổi món nước yêu thích của khách mỗi 8 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setOrderIndex((prev) => (prev + 1) % DRINK_ORDERS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleTapTipJar = () => {
    sound.playTipJingle();
    setIsJingling(true);
    setTimeout(() => setIsJingling(false), 600);
  };

  const currentOrder = DRINK_ORDERS[orderIndex];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto 12px auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* KHÔNG GIAN QUẦY BAR ARTISAN RETRO */}
      <div
        style={{
          width: '100%',
          height: '110px',
          background: 'linear-gradient(180deg, rgba(39, 21, 11, 0.95) 0%, rgba(26, 14, 7, 0.98) 100%)',
          borderRadius: '20px',
          border: '2px solid rgba(180, 83, 9, 0.45)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(253, 230, 138, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 16px 10px 16px',
          boxSizing: 'border-box',
        }}
      >
        {/* Nền quầy kệ gỗ và ly tách phía sau */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '12px',
            right: '12px',
            height: '18px',
            borderBottom: '2px solid rgba(120, 53, 15, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: 0.6,
          }}
        >
          <span style={{ fontSize: '11px' }}>🏺</span>
          <span style={{ fontSize: '11px' }}>☕</span>
          <span style={{ fontSize: '11px' }}>🫙</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '10px', color: '#fde68a', fontWeight: 800 }}>
            {dailyCups} LY/NGÀY
          </span>
        </div>

        {/* 1. MÁY PHA ESPRESSO & TÁCH CAFE BỐC KHÓI */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Làn khói bốc lên */}
          <div
            className="coffee-steam-vapor"
            style={{
              position: 'absolute',
              top: '-18px',
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.75)',
              filter: 'blur(0.5px)',
              pointerEvents: 'none',
            }}
          >
            ♨️
          </div>

          {/* Máy pha cafe mini */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '4px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '42px',
                background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)',
                borderRadius: '8px 8px 4px 4px',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 2px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 6px #ef4444',
                }}
              />
              <div
                style={{
                  width: '18px',
                  height: '6px',
                  background: '#1e293b',
                  borderRadius: '2px',
                }}
              />
            </div>

            {/* Tách cafe gốm sứ */}
            <div
              style={{
                fontSize: '22px',
                transform: 'translateY(-2px)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              }}
            >
              ☕
            </div>
          </div>

          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#d97706',
              marginTop: '4px',
            }}
          >
            QUẦY BAR
          </div>
        </div>

        {/* 2. HŨ TIỀN TIP LENG KENG (Jingling Tip Jar) */}
        <div
          onClick={handleTapTipJar}
          className={isJingling ? 'tip-jar-jingle' : ''}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'transform 0.15s ease',
          }}
          title="Chạm để rung hũ tiền Tip!"
        >
          <div
            style={{
              width: '40px',
              height: '46px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 100%)',
              border: '2px solid rgba(255,255,255,0.6)',
              borderRadius: '10px 10px 14px 14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Nắp hũ kẽm */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                width: '32px',
                height: '5px',
                background: '#cbd5e1',
                borderRadius: '2px',
              }}
            />
            {/* Tiền xu lấp lánh bên trong */}
            <div style={{ fontSize: '18px', marginTop: '4px' }}>🪙</div>
          </div>

          <div
            style={{
              fontSize: '9.5px',
              fontWeight: 900,
              color: '#fde68a',
              marginTop: '3px',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            TIP: {tipAccumulated > 0 ? `+${(tipAccumulated / 1_000_000).toFixed(1)}M` : '0đ'}
          </div>
        </div>

        {/* 3. KHÁCH HÀNG CHIBI ĐỘNG VỚI BIỂU CẢM */}
        <div
          className="cozy-chibi-bounce"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Bong bóng biểu cảm hoặc món nước yêu thích */}
          <div
            style={{
              position: 'absolute',
              top: '-32px',
              background: '#ffffff',
              color: '#1e293b',
              padding: '2px 8px',
              borderRadius: '999px',
              boxShadow: '0 3px 8px rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              border: '1.5px solid #fde68a',
            }}
          >
            {emotion === 'anxious' ? (
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626' }}>
                😰 Lo lắng quá!
              </span>
            ) : emotion === 'happy' ? (
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a' }}>
                ❤️ Tuyệt vời!
              </span>
            ) : (
              <>
                <span style={{ fontSize: '11px' }}>{currentOrder.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: 800 }}>{currentOrder.name}</span>
              </>
            )}
          </div>

          {/* Tim hồng bay lên khi hài lòng */}
          {emotion === 'happy' && (
            <div
              className="heart-float-anim"
              style={{
                position: 'absolute',
                top: '-45px',
                fontSize: '16px',
                pointerEvents: 'none',
              }}
            >
              💖
            </div>
          )}

          {/* Nhân vật Chibi vector */}
          <div
            style={{
              width: '42px',
              height: '52px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Đầu Chibi */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#fed7aa',
                border: '1.5px solid #ea580c',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              {/* Tóc Chibi dễ thương */}
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  width: '34px',
                  height: '14px',
                  background: '#78350f',
                  borderRadius: '12px 12px 4px 4px',
                }}
              />
              {/* Mắt và Miệng */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  marginTop: '4px',
                  zIndex: 1,
                }}
              >
                <div style={{ width: '3px', height: '5px', background: '#451a03', borderRadius: '2px' }} />
                <div style={{ width: '3px', height: '5px', background: '#451a03', borderRadius: '2px' }} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  width: '5px',
                  height: '3px',
                  borderRadius: '0 0 4px 4px',
                  background: emotion === 'happy' ? '#ef4444' : '#c2410c',
                }}
              />
            </div>

            {/* Thân áo Chibi */}
            <div
              style={{
                width: '26px',
                height: '18px',
                background: emotion === 'happy' ? '#10b981' : '#0284c7',
                borderRadius: '6px 6px 0 0',
                marginTop: '-2px',
                border: '1px solid rgba(255,255,255,0.4)',
              }}
            />
          </div>

          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: satisfaction >= 75 ? '#86efac' : '#fde68a',
              marginTop: '2px',
            }}
          >
            ⭐ {satisfaction}%
          </div>
        </div>

        {/* Bề mặt mặt bàn gỗ quầy bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '10px',
            background: 'linear-gradient(180deg, #b45309 0%, #78350f 100%)',
            borderTop: '1.5px solid #fde68a',
          }}
        />
      </div>
    </div>
  );
};
