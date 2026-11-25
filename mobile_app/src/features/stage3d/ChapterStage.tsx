/**
 * CHAPTER STAGE 3D: LỚP DIORAMA 3D BÁN TRONG SUỐT CHO BÀN CỜ B18
 * Nhận GameState và ánh xạ thành các vật thể ẩn dụ 3D thời gian thực.
 * Tối ưu hóa 60 FPS, tự động hạ tải khi thiết bị yếu và giải phóng WebGL sạch sẽ.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Stage3DProps } from './types.ts';
import { extractVisualMetaphors } from './bindings/stateBindings.ts';
import { DebtChainProp } from './props/DebtChainProp.ts';
import { GoalFlagProp } from './props/GoalFlagProp.ts';
import { LightingRig } from './fx/LightingRig.ts';

export const ChapterStage: React.FC<Stage3DProps> = ({
  game,
  pawnCoord = { x: 470, y: 1120 },
  lowPerformanceMode = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ game, pawnCoord, lowPerformanceMode });

  // Luôn giữ tham chiếu mới nhất của state để không tạo lại WebGL context
  useEffect(() => {
    stateRef.current = { game, pawnCoord, lowPerformanceMode };
  }, [game, pawnCoord, lowPerformanceMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Kích thước chuẩn cố định 940 x 1672 px của bàn cờ B18
    const width = 940;
    const height = 1672;

    // 1. Scene Three.js
    const scene = new THREE.Scene();

    // 2. Camera góc nhìn Isometric 2.5D
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 5.2);
    camera.lookAt(0, -0.2, 0);

    // 3. WebGL Renderer với nền trong suốt (alpha: true)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); // Giới hạn DPR <= 1.5 để tiết kiệm pin
    renderer.shadowMap.enabled = false; // Tắt shadow map nặng nề trên mobile
    container.appendChild(renderer.domElement);

    // 4. Khởi tạo Lighting Rig theo Vòng chơi
    const lightingRig = new LightingRig();
    scene.add(lightingRig.group);

    // 5. Khởi tạo Props Ẩn Dụ Cốt Lõi (Đã gỡ bỏ Chồng xu che ô bàn cờ)
    const debtChain = new DebtChainProp();
    scene.add(debtChain.group);

    const goalFlag = new GoalFlagProp();
    // Đặt lá cờ đích ở đường chân trời phía trên của bàn cờ
    goalFlag.setPosition(0, 2.2, -1.8);
    scene.add(goalFlag.group);

    // 6. Hệ hạt bụi nắng/hào quang lơ lửng (Ambient Dust Particles)
    const dustCount = 30;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3 + 0] = (Math.random() - 0.5) * 4.5;
      dustPositions[i * 3 + 1] = Math.random() * 3.5 - 0.5;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 3.0;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // 7. Chuyển đổi tọa độ 2D (940 x 1672 px) sang tọa độ 3D World Space
    const project2Dto3D = (x2d: number, y2d: number) => {
      const normX = (x2d - 470) / 185;
      const normY = -(y2d - 880) / 240;
      return { x: normX, y: normY * 0.45, z: -normY * 0.85 };
    };

    // 8. Animation Loop 60 FPS
    let animId: number;
    let clock = new THREE.Clock();
    let lastTimeOfDay = '';

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const current = stateRef.current;

      // Trích xuất chỉ số ẩn dụ từ engine state
      const metaphors = extractVisualMetaphors(current.game);

      // Cập nhật ánh sáng nếu qua Vòng mới
      if (lastTimeOfDay !== metaphors.timeOfDay) {
        lightingRig.updateTimeOfDay(metaphors.timeOfDay);
        lastTimeOfDay = metaphors.timeOfDay;
      }

      // Tọa độ 3D của vị trí quân cờ hiện tại
      const pawn3D = project2Dto3D(current.pawnCoord.x, current.pawnCoord.y);

      // Cập nhật Dây xích nợ (lệch sang bên trái quân cờ)
      debtChain.update(
        metaphors.debtChainLinks,
        metaphors.isDebtCritical,
        pawn3D.x - 0.32,
        pawn3D.y,
        pawn3D.z + 0.1
      );

      // Cập nhật Lá cờ đích 90M
      goalFlag.update(metaphors.goalProgressRatio, metaphors.goalAchieved, elapsedTime);

      // Chuyển động nhẹ của bụi nắng
      if (!current.lowPerformanceMode) {
        const dPos = dustGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < dustCount; i++) {
          dPos[i * 3 + 1] += 0.003;
          if (dPos[i * 3 + 1] > 3.0) dPos[i * 3 + 1] = -0.5;
        }
        dustGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Dọn dẹp WebGL Context khi unmount
    return () => {
      cancelAnimationFrame(animId);
      debtChain.dispose();
      goalFlag.dispose();
      lightingRig.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="chapter-stage-3d-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '940px',
        height: '1672px',
        pointerEvents: 'none',
        zIndex: 15, // Nằm trên bàn cờ ảnh (Layer 2) và dưới các nút tương tác/quân cờ (Layer 20+)
      }}
    />
  );
};
