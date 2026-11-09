import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';

interface BaristaRushMiniGameProps {
  month: number;
  onComplete: (score: 0 | 1 | 2 | 3) => void;
}

export const BaristaRushMiniGame: React.FC<BaristaRushMiniGameProps> = ({
  month,
  onComplete,
}) => {
  // Step: 1 (Dosing), 2 (Extraction), 3 (Milk Pour), 4 (Summary)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Dosing (Target: 18.0g - 20.0g)
  const [dosingGrams, setDosingGrams] = useState(0);
  const [isDosing, setIsDosing] = useState(false);
  const dosingIntervalRef = useRef<number | null>(null);

  // Step 2: Extraction Gauge (Target: 8.5 - 9.5 bar)
  const [gaugeBar, setGaugeBar] = useState(2.0);
  const gaugeDirectionRef = useRef(1);
  const gaugeAnimRef = useRef<number | null>(null);

  // Step 3: Milk Froth & Pour (Target: 80% - 95%)
  const [milkPercent, setMilkPercent] = useState(10);
  const milkDirectionRef = useRef(1);
  const milkAnimRef = useRef<number | null>(null);

  // Scores for each step: boolean
  const [step1Success, setStep1Success] = useState(false);
  const [step2Success, setStep2Success] = useState(false);
  const [step3Success, setStep3Success] = useState(false);

  // Start sound
  useEffect(() => {
    sound.playEspressoMachine();
  }, []);

  // Step 1 Handler: Hold to Dose
  const startDosing = () => {
    setIsDosing(true);
    sound.playGrinderSound();
    dosingIntervalRef.current = window.setInterval(() => {
      setDosingGrams((prev) => {
        if (prev >= 26.0) {
          stopDosing();
          return 26.0;
        }
        return Number((prev + 0.35).toFixed(1));
      });
    }, 40);
  };

  const stopDosing = () => {
    if (dosingIntervalRef.current) {
      clearInterval(dosingIntervalRef.current);
      dosingIntervalRef.current = null;
    }
    setIsDosing(false);
  };

  const confirmStep1 = () => {
    const isPerfect = dosingGrams >= 18.0 && dosingGrams <= 20.0;
    setStep1Success(isPerfect);
    if (isPerfect) sound.playDingSuccess();
    else sound.playClick();
    setStep(2);
  };

  // Step 2: Extraction Oscillating Gauge
  useEffect(() => {
    if (step === 2) {
      const animateGauge = () => {
        setGaugeBar((prev) => {
          let next = prev + gaugeDirectionRef.current * 0.22;
          if (next >= 14.5) {
            next = 14.5;
            gaugeDirectionRef.current = -1;
          } else if (next <= 1.0) {
            next = 1.0;
            gaugeDirectionRef.current = 1;
          }
          return Number(next.toFixed(1));
        });
        gaugeAnimRef.current = requestAnimationFrame(animateGauge);
      };
      gaugeAnimRef.current = requestAnimationFrame(animateGauge);
      return () => {
        if (gaugeAnimRef.current) cancelAnimationFrame(gaugeAnimRef.current);
      };
    }
  }, [step]);

  const confirmStep2 = () => {
    if (gaugeAnimRef.current) cancelAnimationFrame(gaugeAnimRef.current);
    const isPerfect = gaugeBar >= 8.5 && gaugeBar <= 9.5;
    setStep2Success(isPerfect);
    sound.playEspressoMachine();
    if (isPerfect) sound.playDingSuccess();
    setStep(3);
  };

  // Step 3: Milk Frothing Oscillating Slider
  useEffect(() => {
    if (step === 3) {
      const animateMilk = () => {
        setMilkPercent((prev) => {
          let next = prev + milkDirectionRef.current * 1.8;
          if (next >= 100) {
            next = 100;
            milkDirectionRef.current = -1;
          } else if (next <= 5) {
            next = 5;
            milkDirectionRef.current = 1;
          }
          return Number(next.toFixed(0));
        });
        milkAnimRef.current = requestAnimationFrame(animateMilk);
      };
      milkAnimRef.current = requestAnimationFrame(animateMilk);
      return () => {
        if (milkAnimRef.current) cancelAnimationFrame(milkAnimRef.current);
      };
    }
  }, [step]);

  const confirmStep3 = () => {
    if (milkAnimRef.current) cancelAnimationFrame(milkAnimRef.current);
    const isPerfect = milkPercent >= 75 && milkPercent <= 95;
    setStep3Success(isPerfect);
    sound.playSteamWand();
    if (isPerfect) sound.playDingSuccess();
    setStep(4);
  };

  // Calculate final score
  const totalScore = (
    (step1Success ? 1 : 0) +
    (step2Success ? 1 : 0) +
    (step3Success ? 1 : 0)
  ) as 0 | 1 | 2 | 3;

  const rewardConfig = {
    3: {
      title: '🌟 BARISTA SIÊU HẠNG (PERFECT)',
      tip: 1_500_000,
      buffCups: 15,
      color: '#10B981',
      desc: '3/3 Thao tác hoàn hảo! Khách hàng trầm trồ khen ngợi, để lại tiền tip hậu hĩnh và rủ thêm bạn bè ghé quán!',
    },
    2: {
      title: '👍 TAY NGHỀ CHẮC CHẮN (GOOD)',
      tip: 800_000,
      buffCups: 8,
      color: '#F59E0B',
      desc: '2/3 Thao tác chuẩn mực! Ly cà phê đậm đà chất lượng, khách thưởng tiền tip và đánh giá tích cực.',
    },
    1: {
      title: '☕ ĐẠT TIÊU CHUẨN (PASS)',
      tip: 300_000,
      buffCups: 0,
      color: '#38BDF8',
      desc: '1/3 Thao tác ổn định. Quán phục vụ kịp thời trong giờ cao điểm.',
    },
    0: {
      title: '⚠️ LỖI QUY TRÌNH (NEEDS WORK)',
      tip: 0,
      buffCups: 0,
      color: '#EF4444',
      desc: 'Cà phê bị khét hoặc loãng bọt sữa. Không nhận được tip nhưng bạn đã tích lũy thêm kinh nghiệm.',
    },
  }[totalScore];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
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
          backgroundColor: '#1E293B',
          borderRadius: '26px',
          border: '2px solid #F59E0B',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalFadeIn 0.3s ease',
        }}
      >
        {/* Header HUD */}
        <div
          style={{
            background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
            padding: '12px 18px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', opacity: 0.9 }}>
              MINI-GAME GIỜ CAO ĐIỂM (THÁNG {month})
            </div>
            <div style={{ fontSize: '17px', fontWeight: 900 }}>
              ☕ Thử Thách Quầy Bar 8H Sáng
            </div>
          </div>
          <div
            style={{
              backgroundColor: 'rgba(0,0,0,0.25)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: 800,
            }}
          >
            Bước {step}/3
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {step === 1 && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '42px', marginBottom: '4px' }}>⚖️</div>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>
                BƯỚC 1: CÂN LƯỢNG HẠT (DOSING)
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94A3B8' }}>
                Chạm giữ nút để xả hạt vào tay pha (Portafilter). Nhả tay đúng vùng chuẩn <b>18.0g - 20.0g</b>!
              </p>

              {/* Dosing Display */}
              <div
                style={{
                  backgroundColor: '#0F172A',
                  padding: '16px',
                  borderRadius: '18px',
                  border: '2px solid #334155',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    fontSize: '44px',
                    fontWeight: 900,
                    color: dosingGrams >= 18.0 && dosingGrams <= 20.0 ? '#10B981' : dosingGrams > 20.0 ? '#EF4444' : '#F59E0B',
                    letterSpacing: '1px',
                  }}
                >
                  {dosingGrams.toFixed(1)} <span style={{ fontSize: '20px' }}>g</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Vùng Hoàn Hảo: 18.0g — 20.0g
                </div>
              </div>

              {/* Hold Button */}
              <button
                onPointerDown={startDosing}
                onPointerUp={stopDosing}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  background: isDosing
                    ? 'linear-gradient(180deg, #10B981 0%, #059669 100%)'
                    : 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontFamily: "'Fredoka', sans-serif",
                  boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  marginBottom: '10px',
                  userSelect: 'none',
                }}
              >
                {isDosing ? 'ĐANG XẢ HẠT... (NHẢ TAY ĐỂ NGƯNG)' : 'CHẠM & GIỮ ĐỂ XẢ HẠT'}
              </button>

              {dosingGrams > 0 && !isDosing && (
                <button
                  onClick={confirmStep1}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '14px',
                    border: '1px solid #38BDF8',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38BDF8',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Xác Nhận Nén Cà Phê ➡️
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '42px', marginBottom: '4px' }}>⏱️</div>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>
                BƯỚC 2: CANH ÁP SUẤT CHIẾT XUẤT
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94A3B8' }}>
                Kim áp suất đang dao động. Chạm <b>"CHIẾT XUẤT"</b> đúng vùng vàng <b>8.5 — 9.5 BAR</b>!
              </p>

              {/* Pressure Bar Display */}
              <div
                style={{
                  backgroundColor: '#0F172A',
                  padding: '20px',
                  borderRadius: '18px',
                  border: '2px solid #334155',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '40px',
                    fontWeight: 900,
                    color: gaugeBar >= 8.5 && gaugeBar <= 9.5 ? '#10B981' : '#F59E0B',
                  }}
                >
                  {gaugeBar.toFixed(1)} <span style={{ fontSize: '18px' }}>BAR</span>
                </div>

                {/* Visual Gauge Bar */}
                <div
                  style={{
                    position: 'relative',
                    height: '14px',
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    marginTop: '12px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Golden Zone (8.5 - 9.5 bar out of 15 bar = ~56% to 63%) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '56%',
                      width: '8%',
                      height: '100%',
                      backgroundColor: 'rgba(16, 185, 129, 0.6)',
                      border: '1px solid #10B981',
                    }}
                  />
                  {/* Needle Indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(gaugeBar / 15) * 100}%`,
                      top: 0,
                      width: '4px',
                      height: '100%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 0 8px #FFFFFF',
                      transform: 'translateX(-50%)',
                      transition: 'left 0.04s linear',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={confirmStep2}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontFamily: "'Fredoka', sans-serif",
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                }}
              >
                CHIẾT XUẤT NGAY! ☕
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '42px', marginBottom: '4px' }}>🥛</div>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>
                BƯỚC 3: ĐỔ BỌT SỮA NGHỆ THUẬT (LATTE ART)
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94A3B8' }}>
                Canh độ mịn bọt sữa hoàn hảo trong vùng <b>75% — 95%</b> để tạo hình trái tim!
              </p>

              {/* Milk Slider Display */}
              <div
                style={{
                  backgroundColor: '#0F172A',
                  padding: '20px',
                  borderRadius: '18px',
                  border: '2px solid #334155',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '40px',
                    fontWeight: 900,
                    color: milkPercent >= 75 && milkPercent <= 95 ? '#C084FC' : '#E2E8F0',
                  }}
                >
                  {milkPercent} <span style={{ fontSize: '18px' }}>%</span>
                </div>

                <div
                  style={{
                    position: 'relative',
                    height: '14px',
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    marginTop: '12px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Golden Zone (75% to 95%) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '75%',
                      width: '20%',
                      height: '100%',
                      backgroundColor: 'rgba(192, 132, 252, 0.6)',
                      border: '1px solid #C084FC',
                    }}
                  />
                  {/* Indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${milkPercent}%`,
                      top: 0,
                      width: '4px',
                      height: '100%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 0 8px #FFFFFF',
                      transform: 'translateX(-50%)',
                      transition: 'left 0.04s linear',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={confirmStep3}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(180deg, #A855F7 0%, #7E22CE 100%)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontFamily: "'Fredoka', sans-serif",
                  boxShadow: '0 6px 16px rgba(168, 85, 247, 0.4)',
                }}
              >
                RÓT BỌT SỮA VÀO LY! ❤️
              </button>
            </div>
          )}

          {step === 4 && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
              <h3
                style={{
                  margin: '0 0 8px',
                  fontSize: '18px',
                  fontWeight: 900,
                  color: rewardConfig.color,
                }}
              >
                {rewardConfig.title}
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: '#CBD5E1', lineHeight: 1.5 }}>
                {rewardConfig.desc}
              </p>

              {/* Rewards Summary */}
              <div
                style={{
                  backgroundColor: '#0F172A',
                  padding: '16px',
                  borderRadius: '18px',
                  border: `1.5px solid ${rewardConfig.color}`,
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-around',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>TIỀN TIP NHẬN NGAY</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#34D399' }}>
                    +{rewardConfig.tip.toLocaleString('vi-VN')} VND
                  </div>
                </div>

                {rewardConfig.buffCups > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>BUFF DOANH SỐ</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#38BDF8' }}>
                      +{rewardConfig.buffCups} ly/ngày
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onComplete(totalScore)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontFamily: "'Fredoka', sans-serif",
                  boxShadow: '0 6px 16px rgba(245, 158, 11, 0.4)',
                }}
              >
                In Hóa Đơn P&L Tháng 🧾
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
