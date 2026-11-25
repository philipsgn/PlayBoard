import React from 'react';
import { sound } from '../utils/audio';
import { FintechIcon } from './FintechIcon';

export type MapTab = 'inventory' | 'rules' | null;

interface MapBottomDockProps {
  onOpenInventory: () => void;
  onOpenRules: () => void;
}

export const MapBottomDock: React.FC<MapBottomDockProps> = ({
  onOpenInventory,
  onOpenRules,
}) => {
  return (
    <div
      className="map-bottom-dock-container select-none pointer-events-none"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        padding: '0 14px max(16px, env(safe-area-inset-bottom, 16px)) 14px',
        zIndex: 50,
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxSizing: 'border-box',
      }}
    >
      <button
        type="button"
        onClick={() => {
          sound.playClick();
          onOpenInventory();
        }}
        aria-label="Mở Túi Đồ Danh Mục"
        title="Danh mục Tài sản"
        className="pointer-events-auto fintech-icon-btn"
        style={{
          flex: 1,
          height: '52px',
          padding: '0 16px',
          gap: '8px',
          borderRadius: '16px',
        }}
      >
        <FintechIcon name="portfolio" size={18} color="#38BDF8" />
        <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#F8FAFC' }}>
          Danh mục tài sản
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          sound.playClick();
          onOpenRules();
        }}
        aria-label="Mở Sổ Tay Kiến Thức & Luật Chơi"
        title="Sổ tay & Luật chơi"
        className="pointer-events-auto fintech-icon-btn"
        style={{
          flex: 1,
          height: '52px',
          padding: '0 16px',
          gap: '8px',
          borderRadius: '16px',
        }}
      >
        <FintechIcon name="guide" size={18} color="#FBBF24" />
        <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#F8FAFC' }}>
          Sổ tay & Luật chơi
        </span>
      </button>
    </div>
  );
};
