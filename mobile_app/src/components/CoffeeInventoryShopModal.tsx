import React, { useState } from 'react';
import type { CoffeeShopState } from '../../../src/game/chapter2/types';
import {
  RESTOCK_PACKAGES,
  EQUIPMENT_UPGRADES,
  EquipmentUpgradeType,
} from '../../../src/game/chapter2/engine';
import { sound } from '../utils/audio';

interface CoffeeInventoryShopModalProps {
  state: CoffeeShopState;
  onRestock: (pkgId: string) => void;
  onUpgrade: (type: EquipmentUpgradeType) => void;
  onClose: () => void;
}

export const CoffeeInventoryShopModal: React.FC<CoffeeInventoryShopModalProps> = ({
  state,
  onRestock,
  onUpgrade,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'equipment'>('inventory');

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const handleBuyRestock = (pkgId: string, cost: number) => {
    if (state.cash < cost) {
      sound.playCrisisAlarm();
      return;
    }
    sound.playCoin();
    onRestock(pkgId);
  };

  const handleBuyUpgrade = (type: EquipmentUpgradeType, cost: number) => {
    if (state.cash < cost) {
      sound.playCrisisAlarm();
      return;
    }
    sound.playVictory();
    onUpgrade(type);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        fontFamily: "'Fredoka', sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '92vh',
          backgroundColor: '#1c130d',
          borderRadius: '24px',
          border: '2px solid #b45309',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 24px rgba(245, 158, 11, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#fef3c7',
        }}
      >
        {/* 1. HEADER */}
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: '#2e190e',
            borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fde68a' }}>
              🏪 QUẢN LÝ KHO & NÂNG CẤP QUÁN
            </h2>
            <div style={{ fontSize: '11px', color: '#d97706', marginTop: '2px' }}>
              Tháng {state.month} • Tối ưu biến phí & công suất phục vụ
            </div>
          </div>
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: '#10b981',
              color: '#064e3b',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
            }}
          >
            💰 {formatVND(state.cash)}
          </div>
        </div>

        {/* 2. TAB SWITCHER */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#1e1109',
            padding: '4px',
            borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('inventory');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'inventory' ? '#b45309' : 'transparent',
              color: activeTab === 'inventory' ? '#ffffff' : '#fcd34d',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📦 KHO NGUYÊN LIỆU ({state.inventory.beansRobustaKg + state.inventory.beansArabicaKg}kg Hạt)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('equipment');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'equipment' ? '#b45309' : 'transparent',
              color: activeTab === 'equipment' ? '#ffffff' : '#fcd34d',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ⚡ NÂNG CẤP QUẦY 3D (Lvl {state.equipment.espressoMachineLevel})
          </button>
        </div>

        {/* 3. CONTENT AREA */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {activeTab === 'inventory' ? (
            <>
              {/* Tóm tắt tồn kho hiện tại */}
              <div
                style={{
                  backgroundColor: '#26140b',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: '#fbbf24' }}>Hạt Robusta</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                    {state.inventory.beansRobustaKg} kg
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#fbbf24' }}>Hạt Arabica</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                    {state.inventory.beansArabicaKg} kg
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#fbbf24' }}>Sữa Đặc</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                    {state.inventory.condensedMilkCans} lon
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#fbbf24' }}>Sữa Dalat Milk</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                    {state.inventory.milkSpecialLiters} lít
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#fbbf24' }}>Muối & Syrup</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                    {state.inventory.flavorSyrupUnits} phần
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#fbbf24' }}>Đã Chi Tháng Này</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#f87171' }}>
                    -{formatVND(state.monthRestockSpent)}
                  </div>
                </div>
              </div>

              {/* Danh sách gói nhập sỉ F&B */}
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#fde68a', margin: '4px 0 2px 2px' }}>
                DANH MỤC NHẬP HÀNG CHUẨN ĐỊNH MỨC 2026:
              </div>
              {RESTOCK_PACKAGES.map((pkg) => {
                const canAfford = state.cash >= pkg.cost;
                return (
                  <div
                    key={pkg.id}
                    style={{
                      backgroundColor: '#26140b',
                      borderRadius: '14px',
                      padding: '10px 12px',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                        {pkg.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#d97706', marginTop: '2px', lineHeight: 1.3 }}>
                        {pkg.description}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                        {formatVND(pkg.cost)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuyRestock(pkg.id, pkg.cost)}
                      disabled={!canAfford}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: canAfford ? '#b45309' : '#451a03',
                        color: canAfford ? '#ffffff' : '#9ca3af',
                        fontWeight: 800,
                        fontSize: '11px',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        boxShadow: canAfford ? '0 2px 8px rgba(180, 83, 9, 0.4)' : 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {canAfford ? 'NHẬP HÀNG' : 'THIẾU TIỀN'}
                    </button>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {/* Danh sách nâng cấp thiết bị */}
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#fde68a', margin: '2px 0 2px 2px' }}>
                NÂNG CẤP THIẾT BỊ & KHÔNG GIAN 3D (CỘNG CÔNG SUẤT VẬN HÀNH):
              </div>
              {(Object.keys(EQUIPMENT_UPGRADES) as EquipmentUpgradeType[]).map((type) => {
                const info = EQUIPMENT_UPGRADES[type];
                let isOwned = false;
                if (type === 'espressoMachine_2') isOwned = state.equipment.espressoMachineLevel >= 2;
                if (type === 'espressoMachine_3') isOwned = state.equipment.espressoMachineLevel >= 3;
                if (type === 'grinder_2') isOwned = state.equipment.grinderLevel >= 2;
                if (type === 'pastryCabinet') isOwned = state.equipment.pastryCabinet;
                if (type === 'ambianceLighting') isOwned = state.equipment.ambianceLighting;

                const canAfford = state.cash >= info.cost;

                return (
                  <div
                    key={type}
                    style={{
                      backgroundColor: isOwned ? '#1b2a1a' : '#26140b',
                      borderRadius: '14px',
                      padding: '10px 12px',
                      border: isOwned ? '1px solid #10b981' : '1px solid rgba(245, 158, 11, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: isOwned ? '#6ee7b7' : '#ffffff' }}>
                        {info.title}
                      </div>
                      <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px', lineHeight: 1.3 }}>
                        {info.description}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '10px' }}>
                        <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                          +{info.dailyCupsBuff} Ly/ngày
                        </span>
                        <span style={{ color: '#fcd34d', fontWeight: 700 }}>
                          +{info.satisfactionBuff}% Hài lòng
                        </span>
                        <span style={{ color: '#f87171', fontWeight: 700 }}>
                          +{formatVND(info.monthlyDepreciation)}/tháng khấu hao
                        </span>
                      </div>
                      {!isOwned && (
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                          {formatVND(info.cost)}
                        </div>
                      )}
                    </div>
                    <div>
                      {isOwned ? (
                        <div
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#064e3b',
                            color: '#6ee7b7',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ✓ ĐÃ SỞ HỮU
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBuyUpgrade(type, info.cost)}
                          disabled={!canAfford}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: canAfford ? '#b45309' : '#451a03',
                            color: canAfford ? '#ffffff' : '#9ca3af',
                            fontWeight: 800,
                            fontSize: '11px',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                            boxShadow: canAfford ? '0 2px 8px rgba(180, 83, 9, 0.4)' : 'none',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {canAfford ? 'NÂNG CẤP' : 'THIẾU VỐN'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* 4. FOOTER */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#2e190e',
            borderTop: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            style={{
              padding: '10px 24px',
              backgroundColor: '#10b981',
              color: '#064e3b',
              border: 'none',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            }}
          >
            XÁC NHẬN & VẬN HÀNH ➔
          </button>
        </div>
      </div>
    </div>
  );
};
