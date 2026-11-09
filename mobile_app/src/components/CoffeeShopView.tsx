import React, { useState } from 'react';
import {
  createCoffeeShopGame,
  getCurrentCard,
  applyDecision,
  executeMonthlySettlement,
  triggerCrisis,
  resolveCrisis,
  startBaristaRush,
  applyBaristaRushResult,
} from '../../../src/game/chapter2/engine.ts';
import type { CoffeeShopState } from '../../../src/game/chapter2/types.ts';
import { calculateCashRunway } from '../../../src/game/chapter2/pnl.ts';
import { loadMasterProfile, saveMasterProfile } from '../../../src/game/master-session.ts';
import { money } from '../../../src/game/format.ts';
import { sound } from '../utils/audio.ts';
import { CoffeeDecisionCard } from './CoffeeDecisionCard.tsx';
import { CoffeeReceiptModal } from './CoffeeReceiptModal.tsx';
import { CoffeeCrisisModal } from './CoffeeCrisisModal.tsx';
import { BaristaRushMiniGame } from './BaristaRushMiniGame.tsx';

interface CoffeeShopViewProps {
  onBackToMap: () => void;
  onOpenHelp?: () => void;
}

export const CoffeeShopView: React.FC<CoffeeShopViewProps> = ({
  onBackToMap,
  onOpenHelp,
}) => {
  const masterProfile = loadMasterProfile();
  const carryover = masterProfile.carryoverFromChapter1;
  const initialCapital = carryover?.startingCapitalForCh2 ?? 90_000_000;
  const bonusRunway = carryover?.bonusRunwayCash ?? 0;

  const [game, setGame] = useState<CoffeeShopState>(() =>
    createCoffeeShopGame(initialCapital, bonusRunway)
  );

  const handleApplyOption = (optionId: 'A' | 'B' | 'C') => {
    setGame((prev) => {
      const next = applyDecision(prev, optionId);
      // Sau khi hoàn thành quyết định thứ 2 của mỗi tháng, kích hoạt Thẻ Biến Cố Khủng Hoảng
      if (next.currentCardIndex === 2) {
        const crisisNext = triggerCrisis(next);
        if (crisisNext.phase === 'crisis') {
          return crisisNext;
        }
      }
      // Khi đã giải quyết xong 4 thẻ quyết định ở Tháng 1 hoặc Tháng 2, chuyển sang Barista Rush
      if (
        next.phase === 'monthly_settlement' &&
        !next.baristaRushCompleted &&
        (next.month === 1 || next.month === 2)
      ) {
        return startBaristaRush(next);
      }
      return next;
    });
  };

  const handleResolveCrisis = (optionId: 'A' | 'B' | 'C') => {
    setGame((prev) => resolveCrisis(prev, optionId));
  };

  const handleBaristaRushComplete = (score: 0 | 1 | 2 | 3) => {
    setGame((prev) => applyBaristaRushResult(prev, score));
  };

  const handleContinueSettlement = () => {
    setGame((prev) => {
      const next = executeMonthlySettlement(prev);
      // Nếu hoàn tất Chương 2 với chiến thắng, mở khóa Chương 3
      if (next.phase === 'chapter_result' && next.outcome?.victory) {
        const profile = loadMasterProfile();
        profile.unlockedChapters.chapter3 = true;
        profile.carryoverFromChapter2 = {
          finalMonthlyCashflow: next.outcome.finalNetProfit,
          accumulatedCash: next.cash,
          brandReputation: next.customerSatisfaction,
          completedAt: Date.now(),
        };
        saveMasterProfile(profile);
      }
      return next;
    });
  };

  const handleRestart = () => {
    sound.playClick();
    setGame(createCoffeeShopGame(initialCapital, bonusRunway));
  };

  const currentCard = getCurrentCard(game);
  const latestPnL = game.monthlyPnL[game.monthlyPnL.length - 1];
  const runway = calculateCashRunway(game.cash, latestPnL ? latestPnL.netProfit : -10_000_000);
  const isDangerCash = game.cash < 5_000_000;

  return (
    <div
      className="coffee-shop-container w-full h-full select-none"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1e130c 0%, #2b170c 35%, #180d07 100%)',
        color: '#fcf5e5',
        fontFamily: "'Fredoka', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      {/* 1. TOP VIEWPORT: Quán Cà Phê Artisan Coffeehouse HUD */}
      <header
        style={{
          padding: 'max(14px, env(safe-area-inset-top, 14px)) 12px 10px 12px',
          background: 'rgba(24, 13, 7, 0.92)',
          borderBottom: '2px solid rgba(180, 83, 9, 0.4)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 40,
        }}
      >
        {/* Row 1: Back to Map Button - Header Title - Restart & Help */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => {
              sound.playClick();
              onBackToMap();
            }}
            style={{
              background: '#451a03',
              border: '1.5px solid #b45309',
              borderRadius: '999px',
              padding: '6px 12px',
              color: '#fde68a',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>◀ Bản Đồ</span>
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '9px', letterSpacing: '1px', color: '#f59e0b', fontWeight: 800 }}>
              PLAYBOARD CHAPTER 2
            </span>
            <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>
              CHỦ QUÁN CÀ PHÊ
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {onOpenHelp && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenHelp();
                }}
                style={{
                  background: '#451a03',
                  border: '1.5px solid #b45309',
                  borderRadius: '999px',
                  width: '30px',
                  height: '30px',
                  color: '#fde68a',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ?
              </button>
            )}
            <button
              onClick={handleRestart}
              title="Chơi lại từ đầu"
              style={{
                background: '#451a03',
                border: '1.5px solid #b45309',
                borderRadius: '999px',
                width: '30px',
                height: '30px',
                color: '#fde68a',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              🔄
            </button>
          </div>
        </div>

        {/* Row 2: Live Financial Status Indicators (Tiền mặt, Ly/ngày, Hài lòng, Runway) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            marginTop: '2px',
          }}
        >
          {/* Tiền mặt */}
          <div
            className={isDangerCash ? 'hud-cash-danger-pulse' : ''}
            style={{
              background: 'rgba(43, 23, 12, 0.85)',
              border: `1px solid ${isDangerCash ? '#ef4444' : '#b45309'}`,
              borderRadius: '12px',
              padding: '4px 6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '9px', color: isDangerCash ? '#f87171' : '#fde68a', fontWeight: 800 }}>
              TIỀN MẶT
            </div>
            <strong style={{ fontSize: '12px', color: '#ffffff', whiteSpace: 'nowrap' }}>
              {money(game.cash)}
            </strong>
          </div>

          {/* Lượng ly bán ra/ngày */}
          <div
            style={{
              background: 'rgba(43, 23, 12, 0.85)',
              border: '1px solid #0284c7',
              borderRadius: '12px',
              padding: '4px 6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '9px', color: '#7dd3fc', fontWeight: 800 }}>LY/NGÀY</div>
            <strong style={{ fontSize: '12px', color: '#ffffff' }}>
              ☕ {game.dailyCupsSold}
            </strong>
          </div>

          {/* Độ hài lòng khách hàng */}
          <div
            style={{
              background: 'rgba(43, 23, 12, 0.85)',
              border: '1px solid #16a34a',
              borderRadius: '12px',
              padding: '4px 6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '9px', color: '#86efac', fontWeight: 800 }}>HÀI LÒNG</div>
            <strong style={{ fontSize: '12px', color: '#ffffff' }}>
              ⭐ {game.customerSatisfaction}%
            </strong>
          </div>

          {/* Runway tiền mặt */}
          <div
            style={{
              background: 'rgba(43, 23, 12, 0.85)',
              border: '1px solid #d97706',
              borderRadius: '12px',
              padding: '4px 6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '9px', color: '#fde68a', fontWeight: 800 }}>RUNWAY</div>
            <strong style={{ fontSize: '12px', color: '#ffffff' }}>
              🛡️ {runway === Infinity ? 'Vô hạn' : `${runway}T`}
            </strong>
          </div>
        </div>
      </header>

      {/* 2. MAIN INTERACTIVE VIEWPORT */}
      <main
        style={{
          flex: 1,
          padding: '16px 12px 24px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Phase 1: Thẻ Quyết Định Tình Huống (Polaroid 3D Tilt) */}
        {game.phase === 'decisions' && currentCard && (
          <CoffeeDecisionCard
            card={currentCard}
            month={game.month}
            order={game.currentCardIndex + 1}
            cash={game.cash}
            onSelectOption={handleApplyOption}
          />
        )}

        {/* Phase 1.5: Thẻ Biến Cố Khủng Hoảng Bất Ngờ (Crisis Modal) */}
        {game.phase === 'crisis' && game.activeCrisis && (
          <CoffeeCrisisModal
            crisis={game.activeCrisis}
            onSelectOption={handleResolveCrisis}
          />
        )}

        {/* Phase 1.8: Mini-game Giờ Cao Điểm 8h Sáng (Barista Rush) */}
        {game.phase === 'barista_rush' && (
          <BaristaRushMiniGame
            month={game.month}
            onComplete={handleBaristaRushComplete}
          />
        )}

        {/* Phase 2: Kết Toán P&L Hàng Tháng (Bảng Kẹp Bill Gỗ) */}
        {game.phase === 'monthly_settlement' && (
          <CoffeeReceiptModal
            pnl={latestPnL ?? {
              month: game.month,
              revenue: 0,
              cogs: 0,
              grossProfit: 0,
              fixedCosts: 0,
              netProfit: 0,
              cashEnding: game.cash,
              breakEvenCupsDaily: 40,
              isBreakEven: false,
            }}
            month={game.month}
            dailyCupsSold={game.dailyCupsSold}
            fixedCostsBreakdown={game.fixedCosts}
            onContinue={handleContinueSettlement}
          />
        )}

        {/* Phase 3: Màn Hình Kết Quả Chung Cuộc (Chapter Result) */}
        {game.phase === 'chapter_result' && game.outcome && (
          <div
            className="polaroid-card w-full max-w-[390px] mx-auto text-center"
            style={{
              background: game.outcome.victory ? '#f0fdf4' : '#fef2f2',
              borderColor: game.outcome.victory ? '#22c55e' : '#ef4444',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '24px 18px',
            }}
          >
            <div style={{ fontSize: '48px' }}>
              {game.outcome.victory ? '🏆' : '💀'}
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 900,
                color: game.outcome.victory ? '#15803d' : '#b91c1c',
              }}
            >
              {game.outcome.victory ? 'KHỞI NGHIỆP THÀNH CÔNG!' : 'QUÁN CÀ PHÊ ĐÓNG CỬA!'}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#334155',
                lineHeight: 1.5,
                fontWeight: 600,
              }}
            >
              {game.outcome.reason}
            </p>

            {/* Chi tiết tài chính cuối ván */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '10px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '12px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tiền mặt còn lại:</span>
                <strong style={{ color: '#059669' }}>{money(game.cash)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Lợi nhuận ròng Tháng 3:</span>
                <strong>+{money(game.outcome.finalNetProfit)}/tháng</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Uy tín thương hiệu:</span>
                <strong>{game.outcome.brandReputation}/100 ⭐</strong>
              </div>
            </div>

            {game.outcome.victory && (
              <div
                style={{
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  borderRadius: '10px',
                  padding: '8px',
                  fontSize: '11.5px',
                  color: '#166534',
                  fontWeight: 800,
                }}
              >
                🎉 ĐÃ MỞ KHÓA CHƯƠNG 3: MỞ RỘNG CHUỖI & NHƯỢNG QUYỀN!
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={handleRestart}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Chơi Lại Ch2
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onBackToMap();
                }}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'linear-gradient(180deg, #b45309 0%, #78350f 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                }}
              >
                Về Bản Đồ
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
