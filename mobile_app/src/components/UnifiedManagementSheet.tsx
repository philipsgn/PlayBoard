import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { GameState } from '../../../src/game/types';
import { ASSETS } from '../../../src/data/config';
import { getChapterPreset } from '../../../src/data/chapter-presets';
import { totalWorth } from '../../../src/game/engine';
import { liquidatableFunds, goalProgress } from '../../../src/game/selectors';
import { hasBondCredit } from '../../../src/game/bond-credit';
import { BondHoldings } from '../../../src/components/BondHoldings';
import { GoalChecks } from '../../../src/components/GoalChecks';
import { FinancialTerm } from '../../../src/components/FinancialTerm';
import { investmentLotLabel, maturityLabel, savingsPeriodExplanation } from '../../../src/components/player-language';
import { exportLog } from '../../../src/exportLog';
import { localizeNarrative } from '../../../src/components/glossary';
import { money } from '../../../src/game/format';
import { sound } from '../utils/audio';
import { FintechIcon, type FintechIconName } from './FintechIcon';

interface UnifiedManagementSheetProps {
  game: GameState;
  initialTab?: 'portfolio' | 'log';
  onClose: () => void;
  onHelp?: () => void;
}

const ASSET_ICON_MAP: Record<string, FintechIconName> = {
  cash: 'cash',
  savings: 'bank',
  stocks: 'stocks',
  bonds: 'bonds',
  gold: 'gold',
  business: 'business',
};

export const UnifiedManagementSheet: React.FC<UnifiedManagementSheetProps> = ({
  game,
  initialTab = 'portfolio',
  onClose,
  onHelp,
}) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'log'>(initialTab);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 14);
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkScroll, 80);
    return () => clearTimeout(timer);
  }, [activeTab, game, checkScroll]);

  const switchTab = (tab: 'portfolio' | 'log') => {
    sound.playClick();
    setActiveTab(tab);
  };

  const worth = totalWorth(game);
  const funds = liquidatableFunds(game);
  const goal = goalProgress(game);
  const progress = Math.min(100, Math.max(0, goal.percent));
  const activeDeposits = game.deposits.filter((lot) => lot.status === 'active');
  const chapterPreset = getChapterPreset(game.chapterId ?? 1);
  const baseCap = game.startingCapitalOverride ?? chapterPreset.baseStartingCapital;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2, 6, 23, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '12px',
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playClick();
          onClose();
        }
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 'min(94vw, 420px)',
          height: 'min(86dvh, 720px)',
          background: '#0F172A',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: '22px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
          fontFamily: 'var(--font-sans)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#F8FAFC',
        }}
      >
        {/* Header + Segmented Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px 12px 16px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              flex: 1,
              background: '#1E293B',
              borderRadius: '12px',
              padding: '3px',
              gap: '4px',
            }}
          >
            <button
              onClick={() => switchTab('portfolio')}
              style={{
                flex: 1,
                height: '36px',
                border: 'none',
                borderRadius: '9px',
                background: activeTab === 'portfolio' ? '#10B981' : 'transparent',
                color: activeTab === 'portfolio' ? '#FFFFFF' : '#94A3B8',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <FintechIcon name="portfolio" size={15} />
              <span>Danh mục</span>
            </button>
            <button
              onClick={() => switchTab('log')}
              style={{
                flex: 1,
                height: '36px',
                border: 'none',
                borderRadius: '9px',
                background: activeTab === 'log' ? '#10B981' : 'transparent',
                color: activeTab === 'log' ? '#FFFFFF' : '#94A3B8',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <FintechIcon name="log" size={15} />
              <span>Nhật ký</span>
            </button>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Đóng"
            className="fintech-icon-btn"
            style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0 }}
          >
            <FintechIcon name="close" size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            padding: '12px 16px 14px 16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {activeTab === 'portfolio' ? (
            <>
              {/* KPI Summary Card */}
              <div
                style={{
                  background: '#1E293B',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  marginBottom: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <FinancialTerm term="netWorth">Tổng tài sản ròng</FinancialTerm>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <strong className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                      {money(worth)}
                    </strong>
                    <small
                      className="tabular-nums"
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: worth >= baseCap ? '#34D399' : '#F87171',
                      }}
                    >
                      {worth >= baseCap ? '+' : ''}
                      {money(worth - baseCap)}
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1' }}>
                    <span>
                      Huy động hợp lệ: <strong className="tabular-nums" style={{ color: '#34D399' }}>{money(funds)}</strong> / <strong className="tabular-nums">{goal.target / 1_000_000}M</strong>
                    </span>
                    <strong className="tabular-nums" style={{ color: '#FBBF24' }}>{Math.round(progress)}%</strong>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: funds >= goal.target
                          ? 'linear-gradient(90deg, #10B981, #34D399)'
                          : 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                        transition: 'width 0.35s ease',
                      }}
                    />
                  </div>

                  <details style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Chi tiết công thức huy động hợp lệ</summary>
                    <div style={{ marginTop: '6px', padding: '8px', background: '#0F172A', borderRadius: '10px', color: '#E2E8F0' }}>
                      <GoalChecks game={game} />
                    </div>
                  </details>
                </div>
              </div>

              {/* Asset List */}
              <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div
                  ref={scrollRef}
                  onScroll={checkScroll}
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    paddingRight: '2px',
                    paddingBottom: '12px',
                  }}
                >
                  {Object.entries(ASSETS).map(([key, asset]) => {
                    const amount = game.portfolio[key as keyof typeof ASSETS];
                    const locked =
                      key !== 'cash' &&
                      key !== 'savings' &&
                      amount === 0 &&
                      !game.unlockedAssets.includes(key as 'stocks' | 'bonds' | 'gold' | 'business');
                    const iconName = ASSET_ICON_MAP[key] ?? 'wallet';

                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          background: locked ? 'rgba(30, 41, 59, 0.45)' : '#1E293B',
                          border: '1px solid rgba(148, 163, 184, 0.14)',
                          borderRadius: '12px',
                          opacity: locked ? 0.6 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: locked ? '#64748B' : '#34D399',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <FintechIcon name={iconName} size={17} />
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#F8FAFC' }}>
                              {asset.label}
                            </span>
                            {key === 'cash' && (
                              <small style={{ fontSize: '11px', color: '#34D399' }}>Thanh khoản tức thời</small>
                            )}
                            {key === 'savings' && (
                              <small style={{ fontSize: '11px', color: '#94A3B8' }}>
                                {activeDeposits.length} khoản đang gửi
                              </small>
                            )}
                            {key === 'business' && amount > 0 && (
                              <small style={{ fontSize: '11px', color: '#FBBF24' }}>Chỉ bán tại ô Kinh doanh</small>
                            )}
                            {locked && (
                              <small style={{ fontSize: '11px', color: '#64748B' }}>Chờ dừng tại ô để mở khóa</small>
                            )}
                          </div>
                        </div>

                        <strong
                          className="tabular-nums"
                          style={{
                            fontSize: '13.5px',
                            fontWeight: 700,
                            color: locked ? '#64748B' : '#FFFFFF',
                            whiteSpace: 'nowrap',
                            marginLeft: '8px',
                          }}
                        >
                          {locked ? '—' : money(amount)}
                        </strong>
                      </div>
                    );
                  })}

                  {/* Active Deposits */}
                  {activeDeposits.length > 0 && (
                    <div
                      style={{
                        padding: '10px 12px',
                        background: '#1E293B',
                        borderRadius: '12px',
                        border: '1px solid rgba(56, 189, 248, 0.22)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase' }}>
                        Sổ tiết kiệm đang hoạt động
                      </span>
                      {activeDeposits.map((lot) => (
                        <div
                          key={lot.id}
                          style={{
                            fontSize: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '4px 0',
                            borderBottom: '1px dashed rgba(148, 163, 184, 0.16)',
                            gap: '6px',
                          }}
                        >
                          <span style={{ color: '#CBD5E1' }}>{investmentLotLabel('savings', lot.id)}</span>
                          <strong className="tabular-nums" style={{ color: '#34D399', textAlign: 'right' }}>
                            {money(lot.principal)} ({Math.round(lot.rate * 100)}%, {maturityLabel(lot.maturityLap)})
                          </strong>
                        </div>
                      ))}
                      <p style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.4 }}>{savingsPeriodExplanation}</p>
                    </div>
                  )}

                  {/* Bonds */}
                  {hasBondCredit(game) && game.bondLots.length > 0 && (
                    <details
                      style={{
                        fontSize: '12px',
                        color: '#E2E8F0',
                        background: '#1E293B',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                      }}
                    >
                      <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#FBBF24' }}>
                        Chi tiết lô trái phiếu ({game.bondLots.length} lô)
                      </summary>
                      <div style={{ marginTop: '6px' }}>
                        <BondHoldings game={game} />
                      </div>
                    </details>
                  )}

                  {/* Debt Warning */}
                  {game.portfolio.debt > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: 'rgba(239, 68, 68, 0.14)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#FCA5A5' }}>Nợ vay hiện tại</span>
                        <small style={{ fontSize: '11px', color: '#F87171' }}>Lãi suất 10%/vòng tại ô Xuất phát</small>
                      </div>
                      <strong className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: '#FCA5A5' }}>
                        -{money(game.portfolio.debt)}
                      </strong>
                    </div>
                  )}

                  {onHelp && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onHelp();
                      }}
                      className="fintech-icon-btn"
                      style={{
                        width: '100%',
                        height: '42px',
                        marginTop: '4px',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#FBBF24',
                      }}
                    >
                      <FintechIcon name="guide" size={16} />
                      <span>Mở Sổ Tay Chiến Lược & Luật Chơi</span>
                    </button>
                  )}
                </div>

                {canScrollDown && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '24px',
                      pointerEvents: 'none',
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0) 100%)',
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            /* TAB 2: NHẬT KÝ */
            <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  marginBottom: '8px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                  Đã ghi nhận: <strong style={{ color: '#F8FAFC' }}>{game.log.length}</strong> sự kiện
                </span>
                <button
                  onClick={() => {
                    sound.playClick();
                    exportLog(game);
                  }}
                  className="fintech-icon-btn"
                  style={{ height: '32px', padding: '0 10px', fontSize: '12px', fontWeight: 700, gap: '6px', borderRadius: '8px' }}
                >
                  <FintechIcon name="bonds" size={14} color="#38BDF8" />
                  <span>Xuất JSON</span>
                </button>
              </div>

              <div
                ref={scrollRef}
                onScroll={checkScroll}
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  paddingBottom: '16px',
                }}
              >
                {game.log.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748B', fontSize: '13px' }}>
                    Chưa có giao dịch nào. Hãy gieo xúc xắc để bắt đầu!
                  </div>
                ) : (
                  game.log.toReversed().map((entry) => (
                    <details
                      key={entry.sequence}
                      style={{
                        background: '#1E293B',
                        border: '1px solid rgba(148, 163, 184, 0.14)',
                        borderRadius: '10px',
                        padding: '8px 10px',
                      }}
                    >
                      <summary
                        style={{
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          color: '#F8FAFC',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span className="tabular-nums" style={{ color: '#38BDF8', fontSize: '11.5px', flexShrink: 0 }}>
                          #{entry.sequence} · V{entry.before.lap}
                        </span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'right' }}>
                          {localizeNarrative(entry.title)}
                        </span>
                      </summary>
                      <div style={{ marginTop: '6px', fontSize: '12px', lineHeight: 1.45, color: '#CBD5E1', paddingTop: '6px', borderTop: '1px dashed rgba(148, 163, 184, 0.16)' }}>
                        <p style={{ margin: '2px 0' }}><strong style={{ color: '#F8FAFC' }}>Quyết định:</strong> {localizeNarrative(entry.decision)}</p>
                        <p style={{ margin: '2px 0' }}><strong style={{ color: '#F8FAFC' }}>Hệ quả:</strong> {localizeNarrative(entry.consequence)}</p>
                        <p className="tabular-nums" style={{ margin: '2px 0' }}>
                          <strong style={{ color: '#F8FAFC' }}>Tài sản ròng:</strong> {money(totalWorth(entry.before))} → {money(totalWorth(entry.after))}
                        </p>
                      </div>
                    </details>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
