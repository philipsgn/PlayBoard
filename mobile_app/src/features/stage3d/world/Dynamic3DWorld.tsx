import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { SunlightRig } from './SunlightRig';
import { CafeEnvironment } from './CafeEnvironment';
import { BaristaCharacter } from './BaristaCharacter';
import { CameraDirector } from '../camera/CameraDirector';
import { Pathfinding } from '../director/Pathfinding';
import { ActionRunner } from '../director/ActionRunner';

interface Dynamic3DWorldProps {
  onClose?: () => void;
  initialRoutine?: 'morning' | 'crisis' | null;
}

export const Dynamic3DWorld: React.FC<Dynamic3DWorldProps> = ({ onClose, initialRoutine = 'morning' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [currentActionTitle, setCurrentActionTitle] = useState('Đang khởi tạo không gian...');
  const runnerRef = useRef<ActionRunner | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfef3c7); // Màu vàng nắng sớm ấm áp

    // 2. Camera Director
    const cameraDirector = new CameraDirector(width, height);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); // Tiết kiệm pin mobile
    container.appendChild(renderer.domElement);

    // 4. Các module không gian 3D
    const sunlight = new SunlightRig();
    scene.add(sunlight.group);

    const cafeEnv = new CafeEnvironment();
    scene.add(cafeEnv.group);

    const barista = new BaristaCharacter();
    // Đặt Minh đứng ở vỉa hè trước quán ban đầu
    barista.position.set(0.0, 0.0, 2.8);
    scene.add(barista.group);

    const pathfinding = new Pathfinding();
    const actionRunner = new ActionRunner(barista, cafeEnv, cameraDirector, pathfinding);
    runnerRef.current = actionRunner;

    // 5. Kích hoạt Nghi Thức Mở Quán Buổi Sáng nếu được yêu cầu
    if (initialRoutine === 'morning') {
      setCurrentActionTitle('Nghi Thức Mở Quán Buổi Sáng...');
      actionRunner.runPlan(
        {
          id: 'morning_open_routine',
          steps: [
            { do: 'approach_door', target: 'node_cafe_door_exterior', wait: 0.8 },
            { do: 'take_key_from_pocket', wait: 0.6, props: ['key'] },
            { do: 'unlock_door', wait: 0.8, props: ['key'] },
            { do: 'flip_sign_to_open', wait: 0.6 },
            { do: 'push_door_open', wait: 0.8 },
            { do: 'enter_building', target: 'node_cafe_lobby', wait: 0.8 },
            { do: 'wipe_table', target: 'node_cafe_table_1', wait: 1.2, props: ['cloth'] },
            { do: 'start_coffee_machine', target: 'node_cafe_espresso_station', wait: 1.2 },
            { do: 'greet_customer', wait: 1.0 },
          ],
        },
        () => {
          setCurrentActionTitle('Quán đã sẵn sàng đón khách! ☕');
        }
      );
    }

    // 6. Animation Loop 60 FPS
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Cập nhật môi trường nắng sớm
      sunlight.update(time);

      // Cập nhật cửa, biển và cơ chế cắt lớp tường
      cafeEnv.update(delta);
      cafeEnv.updateCutaway(barista.position.z);

      // Cập nhật nhân vật & chuyển động A*
      barista.update(delta);

      // Cập nhật ActionRunner
      actionRunner.update(delta);

      // Cập nhật Camera Director bám theo Minh
      cameraDirector.update(delta, barista.position);

      renderer.render(scene, cameraDirector.camera);
    };

    animate();

    // 7. Xử lý Resize màn hình
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      cameraDirector.resize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Dọn dẹp WebGL Context triệt để khi unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      sunlight.dispose();
      cafeEnv.dispose();
      barista.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [initialRoutine]);

  const handlePlayMorning = () => {
    if (!runnerRef.current) return;
    setCurrentActionTitle('Minh thực hiện Nghi thức Mở Quán...');
    runnerRef.current.runPlan(
      {
        id: 'morning_open_routine',
        steps: [
          { do: 'approach_door', target: 'node_cafe_door_exterior', wait: 0.8 },
          { do: 'take_key_from_pocket', wait: 0.6, props: ['key'] },
          { do: 'unlock_door', wait: 0.8, props: ['key'] },
          { do: 'flip_sign_to_open', wait: 0.6 },
          { do: 'push_door_open', wait: 0.8 },
          { do: 'enter_building', target: 'node_cafe_lobby', wait: 0.8 },
          { do: 'wipe_table', target: 'node_cafe_table_1', wait: 1.2, props: ['cloth'] },
          { do: 'start_coffee_machine', target: 'node_cafe_espresso_station', wait: 1.2 },
          { do: 'greet_customer', wait: 1.0 },
        ],
      },
      () => setCurrentActionTitle('Quán đã mở cửa đón nắng sớm! ☕')
    );
  };

  const handlePlayCrisisReviewer = (option: 'A' | 'B' | 'C') => {
    if (!runnerRef.current) return;

    if (option === 'A') {
      setCurrentActionTitle('Phương án A: Làm clip cầu thị & mời reviewer thử lại...');
      runnerRef.current.runPlan(
        {
          id: 'crisis_reviewer_A',
          steps: [
            { do: 'idle_check_phone', target: 'node_cafe_barista_pos', wait: 0.8, props: ['phone'] },
            { do: 'hands_on_head_worry', wait: 1.0, props: ['phone'] },
            { do: 'film_video_selfie', target: 'node_cafe_lobby', wait: 1.2, props: ['phone', 'cup'] },
            { do: 'bow_apologize', wait: 0.8 },
            { do: 'hand_over_money', target: 'node_cafe_counter_front', wait: 0.8, props: ['bills'] },
            { do: 'greet_customer', wait: 1.0 },
          ],
        },
        () => setCurrentActionTitle('Khủng hoảng đã hóa cơ hội (+15% Hài lòng)! ⭐')
      );
    } else if (option === 'B') {
      setCurrentActionTitle('Phương án B: Im lặng chờ bão mạng...');
      runnerRef.current.runPlan(
        {
          id: 'crisis_reviewer_B',
          steps: [
            { do: 'cross_arms_wait', target: 'node_cafe_barista_pos', wait: 1.2 },
            { do: 'wipe_table', target: 'node_cafe_table_1', wait: 1.4, props: ['cloth'] },
          ],
        },
        () => setCurrentActionTitle('Doanh số sụt giảm (-15 ly/ngày) ⚠️')
      );
    } else {
      setCurrentActionTitle('Phương án C: Đôi co trên mạng...');
      runnerRef.current.runPlan(
        {
          id: 'crisis_reviewer_C',
          steps: [
            { do: 'type_reply_angry', target: 'node_cafe_barista_pos', wait: 1.2, props: ['phone'] },
            { do: 'point_accuse', wait: 1.0 },
            { do: 'hand_over_money', wait: 0.8, props: ['bills'] },
          ],
        },
        () => setCurrentActionTitle('Khách tẩy chay quán (-25 ly/ngày, -20% Hài lòng) ❌')
      );
    }
  };

  const handleToggleSpeed = () => {
    const nextSpeed = speed === 1 ? 2 : 1;
    setSpeed(nextSpeed);
    runnerRef.current?.setSpeed(nextSpeed);
  };

  const handleSkip = () => {
    runnerRef.current?.skip();
    setCurrentActionTitle('Đã bỏ qua diễn hoạt ⏭️');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        backgroundColor: '#1c1917',
        fontFamily: "'Fredoka', sans-serif",
      }}
    >
      {/* Container 3D Viewport */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />

      {/* Top Banner: Tiêu đề hành động thời gian thực */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid #f59e0b',
            borderRadius: '999px',
            padding: '6px 14px',
            color: '#fef3c7',
            fontSize: '12px',
            fontWeight: 800,
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            pointerEvents: 'auto',
          }}
        >
          {currentActionTitle}
        </div>

        {/* Nút thoát về chế độ 2.5D */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: '#dc2626',
              border: 'none',
              borderRadius: '999px',
              padding: '6px 12px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              pointerEvents: 'auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            ✕ Thu Nhỏ 3D
          </button>
        )}
      </div>

      {/* Bottom Floating Control Deck: Các nút kịch bản kiểm thử trực tiếp */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '12px',
          right: '12px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800 }}>
            🎬 ĐIỀU PHỐI HÀNH ĐỘNG 3D LIVE:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleToggleSpeed}
              style={{
                background: speed === 2 ? '#f59e0b' : '#334155',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ⚡ x{speed}
            </button>
            <button
              onClick={handleSkip}
              style={{
                background: '#475569',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ⏭️ Bỏ Qua
            </button>
          </div>
        </div>

        {/* Action Triggers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          <button
            onClick={handlePlayMorning}
            style={{
              padding: '8px 10px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            ☀️ Mở Quán Sáng (Cửa Xoay 90°)
          </button>

          <button
            onClick={() => handlePlayCrisisReviewer('A')}
            style={{
              padding: '8px 10px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            ⭐ Reviewer (Phương án A)
          </button>

          <button
            onClick={() => handlePlayCrisisReviewer('B')}
            style={{
              padding: '8px 10px',
              borderRadius: '10px',
              border: 'none',
              background: '#334155',
              color: '#cbd5e1',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            ⚠️ Reviewer (Phương án B)
          </button>

          <button
            onClick={() => handlePlayCrisisReviewer('C')}
            style={{
              padding: '8px 10px',
              borderRadius: '10px',
              border: 'none',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            ❌ Reviewer (Phương án C)
          </button>
        </div>
      </div>
    </div>
  );
};
