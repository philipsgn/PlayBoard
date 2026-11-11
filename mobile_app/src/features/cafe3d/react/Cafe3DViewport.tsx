import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { SunlightRig } from '../../stage3d/world/SunlightRig';
import { CafeEnvironment } from '../../stage3d/world/CafeEnvironment';
import { BaristaCharacter } from '../../stage3d/world/BaristaCharacter';
import { CameraDirector } from '../../stage3d/camera/CameraDirector';
import { Pathfinding } from '../../stage3d/director/Pathfinding';
import { ActionRunner } from '../../stage3d/director/ActionRunner';
import { ShiftSim } from '../domain/shiftSim';
import { ActionDirector } from '../domain/director';
import { TaskQueue } from '../domain/taskQueue';
import { createRNG } from '../domain/rng';
import { ShiftHud } from './ShiftHud';
import type { VenueId, ShiftResult, Task, Customer } from '../domain/types';

export interface Cafe3DViewportRef {
  playEventAction: (eventId: string, optionId?: 'A' | 'B' | 'C') => void;
  startShift: (shiftSeconds?: number) => void;
}

interface Cafe3DViewportProps {
  venue?: VenueId;
  cupsPerDay?: number;
  seed?: string;
  isEmbedded?: boolean;
  onToggleFullscreen?: () => void;
  onCompleteShift?: (result: ShiftResult) => void;
}

export const Cafe3DViewport = forwardRef<Cafe3DViewportRef, Cafe3DViewportProps>(
  (
    {
      venue = 'main_street',
      cupsPerDay = 40,
      seed = 'cafe_2026',
      isEmbedded = true,
      onToggleFullscreen,
      onCompleteShift,
    },
    ref
  ) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const runnerRef = useRef<ActionRunner | null>(null);
    const shiftSimRef = useRef<ShiftSim | null>(null);

    const [isShiftActive, setIsShiftActive] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [servedCount, setServedCount] = useState(0);
    const [walkedOutCount, setWalkedOutCount] = useState(0);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [taskQueue, setTaskQueue] = useState<readonly Task[]>([]);
    const [suggestedTask, setSuggestedTask] = useState<Task | null>(null);
    const [autoMode, setAutoMode] = useState(false);
    const [customers, setCustomers] = useState<readonly Customer[]>([]);
    const [actionBanner, setActionBanner] = useState<string | null>(null);

    const [isDebug] = useState(
      () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '3d'
    );

    // Phơi bày API cho component cha (CoffeeShopView) gọi
    useImperativeHandle(ref, () => ({
      playEventAction: (eventId: string, optionId?: 'A' | 'B' | 'C') => {
        const plan = ActionDirector.mapEventToActionPlan(eventId, optionId);
        if (plan && runnerRef.current) {
          setActionBanner(`🎬 Minh thực hiện: ${plan.id}`);
          runnerRef.current.runPlan(
            {
              id: plan.id,
              steps: plan.steps.map((s) => ({
                do: s.do,
                target: s.at,
                wait: s.wait,
                props: s.props,
                vfx: s.vfx,
              })),
            },
            () => {
              setActionBanner(null);
            }
          );
        }
      },
      startShift: (shiftSeconds = 60) => {
        const rng = createRNG(`${seed}_shift_${Date.now()}`);
        const sim = new ShiftSim(
          {
            cupsPerDay,
            shiftSeconds,
            shiftScale: 1.0,
            venue,
            seed,
          },
          rng
        );
        shiftSimRef.current = sim;
        setIsShiftActive(true);
        setTimeRemaining(shiftSeconds);
      },
    }));

    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      const width = container.clientWidth || 390;
      const height = container.clientHeight || 280;

      // 1. Three.js Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xfef3c7); // Nắng sớm Scandinavian ấm áp

      // 2. Camera Director (Dollhouse view)
      const cameraDirector = new CameraDirector(width, height);

      // 3. Renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      container.appendChild(renderer.domElement);

      // 4. Môi trường & Nhân vật Minh Barista
      const sunlight = new SunlightRig();
      scene.add(sunlight.group);

      const cafeEnv = new CafeEnvironment();
      scene.add(cafeEnv.group);

      const barista = new BaristaCharacter();
      barista.position.set(0.0, 0.0, -1.2); // Đứng sau quầy sẵn sàng
      scene.add(barista.group);

      const pathfinding = new Pathfinding();
      const actionRunner = new ActionRunner(barista, cafeEnv, cameraDirector, pathfinding);
      runnerRef.current = actionRunner;

      // 5. Vòng lặp animation 60 FPS
      let animId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        sunlight.update(time);
        cafeEnv.update(delta);
        cafeEnv.updateCutaway(barista.position.z);
        barista.update(delta);
        actionRunner.update(delta);
        cameraDirector.update(delta, barista.position);

        // Cập nhật ShiftSim nếu ca làm việc đang diễn ra
        if (shiftSimRef.current) {
          const events = shiftSimRef.current.update(delta);
          const custs = shiftSimRef.current.getCustomers();
          setCustomers([...custs]);
          setTimeRemaining(shiftSimRef.current.getTimeRemaining());
          setCurrentTask(shiftSimRef.current.getCurrentTask());
          setTaskQueue([...shiftSimRef.current.getTaskQueue()]);
          setSuggestedTask(TaskQueue.suggestNextTask([...custs]));

          for (const ev of events) {
            if (ev.t === 'served') {
              setServedCount((prev) => prev + 1);
            } else if (ev.t === 'customerLeft' && ev.angry) {
              setWalkedOutCount((prev) => prev + 1);
            } else if (ev.t === 'shiftEnded') {
              setIsShiftActive(false);
              if (onCompleteShift) {
                onCompleteShift(ev.result);
              }
              shiftSimRef.current = null;
            }
          }
        }

        renderer.render(scene, cameraDirector.camera);
      };

      animate();

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth || 390;
        const h = container.clientHeight || 280;
        renderer.setSize(w, h);
        cameraDirector.resize(w, h);
      };
      window.addEventListener('resize', handleResize);

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
    }, [venue, onCompleteShift]);

    const handleAssignTask = (task: Task) => {
      if (shiftSimRef.current) {
        shiftSimRef.current.assignTask(task);
      }
    };

    const handleToggleAuto = () => {
      if (shiftSimRef.current) {
        shiftSimRef.current.autoMode = !autoMode;
        setAutoMode(!autoMode);
      }
    };

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: isEmbedded ? '18px' : '0px',
          boxShadow: isEmbedded ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {/* Three.js Canvas Container */}
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {/* Action Banner (khi phát kịch bản tình huống) */}
        {actionBanner && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.88)',
              border: '1.5px solid #f59e0b',
              borderRadius: '999px',
              padding: '6px 14px',
              color: '#fef3c7',
              fontSize: '12px',
              fontWeight: 800,
              zIndex: 30,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            {actionBanner}
          </div>
        )}

        {/* Nút phóng to "LÀM CA / TOÀN CẢNH" ở chế độ nhúng */}
        {isEmbedded && !isShiftActive && onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '999px',
              padding: '4px 10px',
              color: '#fef3c7',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 25,
            }}
          >
            <span>🔍 Toàn Cảnh 3D</span>
          </button>
        )}

        {/* HUD điều khiển Ca Làm Việc 3D */}
        {isShiftActive && (
          <ShiftHud
            timeRemaining={timeRemaining}
            servedCount={servedCount}
            walkedOutCount={walkedOutCount}
            currentTask={currentTask}
            taskQueue={taskQueue}
            suggestedTask={suggestedTask}
            autoMode={autoMode}
            onAssignTask={handleAssignTask}
            onToggleAuto={handleToggleAuto}
            onMinimize={() => setIsShiftActive(false)}
            customers={customers}
          />
        )}

        {/* Debug panel: CHỈ HIỂN THỊ KHI ?debug=3d */}
        {isDebug && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '10px',
              zIndex: 50,
            }}
          >
            🛠️ DEBUG 3D LIVE
          </div>
        )}
      </div>
    );
  }
);
