import React from 'react';
import type { Task, Customer } from '../domain/types';

interface ShiftHudProps {
  timeRemaining: number;
  servedCount: number;
  walkedOutCount: number;
  currentTask: Task | null;
  taskQueue: readonly Task[];
  suggestedTask: Task | null;
  autoMode: boolean;
  onAssignTask: (task: Task) => void;
  onToggleAuto: () => void;
  onMinimize: () => void;
  customers: readonly Customer[];
}

export const ShiftHud: React.FC<ShiftHudProps> = ({
  timeRemaining,
  servedCount,
  walkedOutCount,
  currentTask,
  taskQueue,
  suggestedTask,
  autoMode,
  onAssignTask,
  onToggleAuto,
  onMinimize,
  customers,
}) => {
  const formatSeconds = (sec: number) => {
    const s = Math.ceil(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const getTaskLabel = (task: Task | null): { title: string; icon: string; bg: string } => {
    if (!task) return { title: 'Đứng Quầy Sẵn Sàng', icon: '☕', bg: '#475569' };
    switch (task.kind) {
      case 'greet':
        return { title: 'Chào Khách Vào Quán', icon: '👋', bg: '#0284c7' };
      case 'order':
        return { title: 'Ghi Order Đồ Uống', icon: '📋', bg: '#d97706' };
      case 'brew':
        return { title: 'Pha Chế Cà Phê', icon: '☕', bg: '#b45309' };
      case 'pay':
        return { title: 'Thu Tiền & Quẹt QR', icon: '💵', bg: '#16a34a' };
      case 'clean':
        return { title: 'Dọn Dẹp Bàn Ghế', icon: '🧽', bg: '#64748b' };
      default:
        return { title: 'Thao Tác Quán', icon: '⚡', bg: '#475569' };
    }
  };

  const currentLabel = getTaskLabel(currentTask);
  const actionLabel = getTaskLabel(suggestedTask);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px 14px',
        zIndex: 40,
        boxSizing: 'border-box',
      }}
    >
      {/* Top Bar: Đồng hồ đếm lùi, số ly phục vụ, nút Thu nhỏ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid #f59e0b',
            borderRadius: '999px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fef3c7',
            fontSize: '12.5px',
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <span>⏳ {formatSeconds(timeRemaining)}</span>
          <span style={{ color: '#94a3b8' }}>•</span>
          <span style={{ color: '#34d399' }}>☕ Đã bán: {servedCount}</span>
          {walkedOutCount > 0 && (
            <>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span style={{ color: '#f87171' }}>⚠️ Bỏ về: {walkedOutCount}</span>
            </>
          )}
        </div>

        <button
          onClick={onMinimize}
          style={{
            background: 'rgba(239, 68, 68, 0.9)',
            border: 'none',
            borderRadius: '999px',
            padding: '6px 14px',
            color: '#ffffff',
            fontSize: '11.5px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          🗗 Thu Nhỏ
        </button>
      </div>

      {/* Middle Floating Badges: Khách đang chờ và việc đang thực hiện */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          alignItems: 'flex-start',
        }}
      >
        {currentTask && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              borderRadius: '10px',
              border: `1.5px solid ${currentLabel.bg}`,
              padding: '6px 12px',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{currentLabel.icon}</span>
            <span>Đang làm: {currentLabel.title}</span>
          </div>
        )}

        {taskQueue.length > 0 && (
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.75)',
              borderRadius: '8px',
              padding: '4px 10px',
              color: '#94a3b8',
              fontSize: '10.5px',
              fontWeight: 700,
            }}
          >
            📋 Hàng đợi: {taskQueue.length}/3 việc tiếp theo
          </div>
        )}
      </div>

      {/* Bottom Context Action Area: 1 ngón cái điều khiển */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'auto',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '12px 14px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800 }}>
            👥 KHÁCH TRONG QUÁN: {customers.length} NGƯỜI
          </span>
          <button
            onClick={onToggleAuto}
            style={{
              background: autoMode ? '#10b981' : '#334155',
              border: 'none',
              borderRadius: '8px',
              padding: '4px 10px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {autoMode ? '🤖 Tự Động: BẬT' : '🤖 Tự Động: TẮT'}
          </button>
        </div>

        {/* Nút Ngữ Cảnh Chính: To, dễ bấm bằng 1 ngón cái (≥ 48dp) */}
        {suggestedTask ? (
          <button
            onClick={() => onAssignTask(suggestedTask)}
            disabled={autoMode}
            style={{
              width: '100%',
              minHeight: '48px',
              padding: '12px',
              borderRadius: '14px',
              border: 'none',
              background: autoMode
                ? '#334155'
                : `linear-gradient(135deg, ${actionLabel.bg} 0%, #0f172a 100%)`,
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 900,
              cursor: autoMode ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ fontSize: '18px' }}>{actionLabel.icon}</span>
            <span>{autoMode ? 'Minh đang tự phục vụ khách...' : actionLabel.title}</span>
          </button>
        ) : (
          <div
            style={{
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontSize: '12.5px',
              fontWeight: 700,
            }}
          >
            ☕ Quán đang yên tĩnh chờ khách mới ghé...
          </div>
        )}
      </div>
    </div>
  );
};

