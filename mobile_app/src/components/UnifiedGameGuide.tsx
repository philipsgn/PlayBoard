import { useState, useRef } from 'react';
import { GlossaryText, FinancialGlossary } from '../../../src/components/FinancialTerm';
import { CustomerPreferenceCard } from '../../../src/components/CustomerPreferenceCard';
import { livingPresentation } from '../game/living-presentation';
import { goalForGame } from '../../../src/game/rules-profile';
import { goalProgress } from '../../../src/game/selectors';
import { boardFor, MULTI_COURSE_B18_BOARD } from '../../../src/data/board';
import { tileDisplayLabel } from '../../../src/components/player-language';
import type { GameState } from '../../../src/game/types';
import { sound } from '../utils/audio';
import { FintechIcon, type FintechIconName } from './FintechIcon';

const formatCompactMoney = (value: number): string => {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `${Number.isInteger(k) ? k : k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `${value} ₫`;
};

interface UnifiedGameGuideProps {
  firstTime?: boolean;
  onClose: () => void;
  game?: GameState;
  initialTab?: number;
}

interface GuideTabDef {
  id: number;
  label: string;
  title: string;
  icon: FintechIconName;
  accent: string;
}

const GUIDE_TABS: GuideTabDef[] = [
  { id: 0, label: 'Mục tiêu', title: 'Lộ Trình 3 Chương', icon: 'goal', accent: '#10B981' },
  { id: 1, label: 'Bàn cờ', title: '18 Ô Bàn Cờ B18', icon: 'map', accent: '#38BDF8' },
  { id: 2, label: 'Luật chơi', title: 'Quy Trình Lượt Chơi', icon: 'round', accent: '#8B5CF6' },
  { id: 3, label: 'Kênh đầu tư', title: '5 Kênh Tài Sản', icon: 'stocks', accent: '#F59E0B' },
  { id: 4, label: 'Bẫy & Rủi ro', title: '6 Bẫy Tài Chính', icon: 'margin', accent: '#EF4444' },
];

export function UnifiedGameGuide({ firstTime = false, onClose, game, initialTab = 0 }: UnifiedGameGuideProps) {
  const [currentTab, setCurrentTab] = useState(() => Math.max(0, Math.min(GUIDE_TABS.length - 1, initialTab)));
  const scrollRef = useRef<HTMLDivElement>(null);
  const living = livingPresentation(game);
  const board = game ? boardFor(game) : MULTI_COURSE_B18_BOARD;
  const activeTab = GUIDE_TABS[currentTab];

  const navigateTo = (idx: number) => {
    const valid = Math.max(0, Math.min(GUIDE_TABS.length - 1, idx));
    sound.playClick();
    setCurrentTab(valid);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        background: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !firstTime) {
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
        {/* Top Header */}
        <div
          style={{
            padding: '14px 16px 12px 16px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.14)',
                color: '#34D399',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FintechIcon name="guide" size={18} />
            </span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                Sổ Tay Chiến Lược
              </div>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8' }}>
                PlayBoard · 3 Chương Đầu Tư Tài Chính
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label={firstTime ? 'Bỏ qua' : 'Đóng'}
            className="fintech-icon-btn"
            style={{ width: '36px', height: '36px', borderRadius: '10px' }}
          >
            <FintechIcon name="close" size={18} />
          </button>
        </div>

        {/* 5 Clean Tabs */}
        <div
          role="tablist"
          style={{
            display: 'flex',
            gap: '6px',
            padding: '10px 12px',
            background: '#1E293B',
            borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
            overflowX: 'auto',
            flexShrink: 0,
          }}
        >
          {GUIDE_TABS.map((tab, idx) => {
            const active = currentTab === idx;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => navigateTo(idx)}
                style={{
                  flex: '1 0 auto',
                  height: '34px',
                  padding: '0 10px',
                  borderRadius: '9px',
                  border: active ? `1px solid ${tab.accent}` : '1px solid transparent',
                  background: active ? 'rgba(15, 23, 42, 0.9)' : 'transparent',
                  color: active ? '#FFFFFF' : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: active ? 700 : 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                }}
              >
                <FintechIcon name={tab.icon} size={13} color={active ? tab.accent : '#64748B'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '13px',
            lineHeight: 1.55,
            color: '#CBD5E1',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(148, 163, 184, 0.14)' }}>
            <FintechIcon name={activeTab.icon} size={18} color={activeTab.accent} />
            <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#FFFFFF' }}>{activeTab.title}</h3>
          </div>

          {currentTab === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {game && (
                <div style={{ background: '#1E293B', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>Tiến độ ván hiện tại:</span>
                  <strong className="tabular-nums" style={{ fontSize: '13.5px', color: '#34D399' }}>
                    {formatCompactMoney(goalProgress(game).funds)} / {formatCompactMoney(goalForGame(game).target)}
                  </strong>
                </div>
              )}

              <div style={{ background: '#1E293B', borderRadius: '12px', padding: '12px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <div style={{ fontWeight: 700, color: '#34D399', marginBottom: '4px' }}>Chương 1: Khởi Đầu Tích Lũy (50M → 90M)</div>
                <p>4 Vòng (4 Quý). Lương 14M, sinh hoạt phí 5M/vòng, đệm an toàn 10M. Rút tiết kiệm trước hạn mất 100% lãi.</p>
              </div>

              <div style={{ background: '#1E293B', borderRadius: '12px', padding: '12px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <div style={{ fontWeight: 700, color: '#38BDF8', marginBottom: '4px' }}>Chương 2: Đòn Bẩy Tăng Trưởng (90M+ → 180M)</div>
                <p>Kế thừa tối đa +15M thặng dư từ Ch1. Sinh hoạt phí tăng +1M lạm phát mỗi vòng. Mở khóa <strong>Thẻ Tình Huống Hệ Quả Trễ</strong> (Bảo hiểm phòng vệ vs. Cắt giảm bảo trì).</p>
              </div>

              <div style={{ background: '#1E293B', borderRadius: '12px', padding: '12px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <div style={{ fontWeight: 700, color: '#FBBF24', marginBottom: '4px' }}>Chương 3: Bão Vĩ Mô & Tự Do Tài Chính (180M+ → 360M)</div>
                <p>5 Vòng chu kỳ kinh tế, kế thừa tối đa +30M từ Ch2. Hạn mức vay đòn bẩy 120M kèm <strong>Call Margin</strong> tự động thanh lý (phạt 5%) nếu Nợ / Tài sản thanh khoản &gt; 60%.</p>
              </div>
            </div>
          )}

          {currentTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p>Bàn cờ gồm <strong>{board.length} ô</strong>. Chỉ ô dừng chân mới kích hoạt sự kiện; đi ngang qua không kích hoạt (trừ ô Xuất phát kết toán vòng).</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {board.map((tile) => (
                  <div
                    key={tile.index}
                    style={{
                      background: '#1E293B',
                      border: '1px solid rgba(148, 163, 184, 0.15)',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span className="tabular-nums" style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', minWidth: '20px' }}>
                      #{tile.index + 1}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#F8FAFC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tile.type === 'start' ? 'Xuất phát' : tileDisplayLabel(tile.label)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#1E293B', borderRadius: '12px', padding: '12px' }}>
                <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>Thứ tự tại ô Xuất phát (START)</strong>
                <p>1. Cập nhật thị trường → 2. Nhận lương → 3. Thu nhập Tiệm kinh doanh → 4. Đáo hạn tiết kiệm & Coupon trái phiếu → 5. Trừ sinh hoạt phí ({formatCompactMoney(living.amount)}) → 6. Trả nợ/nghĩa vụ → 7. Quyền bán tài sản tài chính.</p>
              </div>
              <div style={{ background: '#1E293B', borderRadius: '12px', padding: '12px' }}>
                <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>Nguyên tắc Huy động hợp lệ</strong>
                <p><GlossaryText text="Chỉ tính Tiền mặt + Gốc tiết kiệm + Giá bán ròng Cổ phiếu/Vàng/Trái phiếu - Nợ. Không tính Tiệm kinh doanh chưa bán hoặc lãi sổ chưa đáo hạn." /></p>
              </div>
            </div>
          )}

          {currentTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {game && <CustomerPreferenceCard game={game} />}
              {[
                { icon: 'bank' as const, name: 'Tiết kiệm Ngân hàng', desc: 'Kỳ hạn 1–3 vòng (lãi 4%–6%/kỳ). Rút sớm toàn khoản khi thiếu tiền sẽ mất 100% lãi.' },
                { icon: 'stocks' as const, name: 'Cổ phiếu 3 ngành', desc: 'Công nghệ, Ngân hàng, Sản xuất. Tăng trưởng cao nhưng biến động mạnh theo cú sốc vĩ mô.' },
                { icon: 'bonds' as const, name: 'Trái phiếu V2.5', desc: 'An Tâm (ổn định) vs. Bứt Phá (coupon cao nhưng có nguy cơ chậm trả / vỡ nợ khi thắt chặt tín dụng).' },
                { icon: 'gold' as const, name: 'Vàng trú ẩn', desc: 'Chênh lệch mua/bán 3% + phí 1%. Thường tăng mạnh khi thị trường bất định.' },
                { icon: 'business' as const, name: 'Tiệm kinh doanh', desc: 'Tạo dòng tiền mỗi vòng, nhưng bị khóa thanh khoản: chỉ bán được khi dừng đúng ô Kinh doanh.' },
              ].map((item) => (
                <div key={item.name} style={{ background: '#1E293B', borderRadius: '12px', padding: '10px 12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.14)', color: '#FBBF24', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FintechIcon name={item.icon} size={16} />
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentTab === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '12px' }}>
                <strong style={{ color: '#FCA5A5', display: 'block', marginBottom: '4px' }}>6 Khúc Mắc Cần Giải Đố</strong>
                <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li><strong>Bẫy thanh khoản:</strong> Hết tiền mặt bị ép rút sổ mất lãi hoặc vay 10%/vòng.</li>
                  <li><strong>Rủi ro tín dụng:</strong> Trái phiếu lãi cao dễ chậm trả/vỡ nợ khi thắt chặt tín dụng.</li>
                  <li><strong>Chi phí cơ hội:</strong> Mua khóa học hay gửi kỳ hạn 3 vòng quá muộn sẽ không kịp hoàn vốn.</li>
                  <li><strong>Đảo chiều vĩ mô:</strong> Đu đỉnh một kênh không phòng vệ bằng Vàng/Tiết kiệm.</li>
                  <li><strong>Quyết toán vòng cuối:</strong> Quên bán Tiệm kinh doanh trước khi về đích.</li>
                  <li><strong>Lạm phát & Call Margin:</strong> Cắt giảm bảo trì giảm 35% doanh thu; nợ vượt 60% tài sản bị bán cưỡng chế phạt 5%.</li>
                </ul>
              </div>
              <div style={{ background: '#1E293B', borderRadius: '12px', padding: '12px' }}>
                <FinancialGlossary />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer CTA */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(148, 163, 184, 0.16)',
            background: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => navigateTo(currentTab - 1)}
            disabled={currentTab === 0}
            className="fintech-icon-btn"
            style={{
              height: '42px',
              padding: '0 14px',
              fontSize: '13px',
              fontWeight: 700,
              opacity: currentTab === 0 ? 0.4 : 1,
              cursor: currentTab === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Trước
          </button>

          {currentTab < GUIDE_TABS.length - 1 ? (
            <button
              onClick={() => navigateTo(currentTab + 1)}
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '12px',
                border: 'none',
                background: '#10B981',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Tiếp theo ({currentTab + 1}/{GUIDE_TABS.length})
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '12px',
                border: 'none',
                background: '#10B981',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {firstTime ? 'Bắt đầu chơi ngay' : 'Đã hiểu'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
