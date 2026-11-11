import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { EquipmentLevels } from '../../../src/game/chapter2/types';

export type Barista3DAction = 'idle' | 'brewing' | 'celebrate';
export type Customer3DAction = 'waiting' | 'delighted' | 'anxious';
export type BaristaStation = 'grind' | 'extract' | 'milk';

interface CoffeeShop3DViewProps {
  baristaAction?: Barista3DAction;
  customerAction?: Customer3DAction;
  isCrisis?: boolean;
  equipment?: EquipmentLevels;
  activeStation?: BaristaStation | null;
  onStationClick?: (station: BaristaStation) => void;
  isBreakdown?: boolean;
  isRepairing?: boolean;
  celebrate100M?: boolean;
}

export const CoffeeShop3DView: React.FC<CoffeeShop3DViewProps> = ({
  baristaAction = 'idle',
  customerAction = 'waiting',
  isCrisis = false,
  equipment = {
    espressoMachineLevel: 1,
    grinderLevel: 1,
    pastryCabinet: false,
    ambianceLighting: false,
  },
  activeStation = null,
  onStationClick: _onStationClick,
  isBreakdown = false,
  isRepairing = false,
  celebrate100M = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef({
    baristaAction,
    customerAction,
    isCrisis,
    equipment,
    activeStation,
    isBreakdown,
    isRepairing,
    celebrate100M,
  });

  // Update refs on prop change for animation loop
  useEffect(() => {
    actionsRef.current = {
      baristaAction,
      customerAction,
      isCrisis,
      equipment,
      activeStation,
      isBreakdown,
      isRepairing,
      celebrate100M,
    };
  }, [
    baristaAction,
    customerAction,
    isCrisis,
    equipment,
    activeStation,
    isBreakdown,
    isRepairing,
    celebrate100M,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 390;
    const height = container.clientHeight || 280;

    // 1. SCENE & RENDERER
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0f08);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // Góc nhìn Isometric nghiêng ấm cúng
    camera.position.set(0, 3.8, 6.2);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. LIGHTING (Ánh sáng ấm cúng đèn vàng cafe)
    const ambientLight = new THREE.AmbientLight(0xffecd0, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Đèn ấm quầy bar (Warm Bar Glow)
    const warmBarLight = new THREE.PointLight(0xf59e0b, 1.8, 8);
    warmBarLight.position.set(0, 2.8, 0.5);
    scene.add(warmBarLight);

    // 3. COZY CAFE ROOM & SÀN GỖ
    // Sàn gỗ ấm áp
    const floorGeo = new THREE.PlaneGeometry(10, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x3d2010,
      roughness: 0.6,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Tường sau ấm áp
    const wallGeo = new THREE.BoxGeometry(10, 5, 0.2);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x241208, roughness: 0.8 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 2.5, -2.5);
    wall.receiveShadow = true;
    scene.add(wall);

    // Lam gỗ dọc 3D trang trí vách tường sau phong cách Lofi/Japandi
    for (let lx = -4.6; lx <= 4.6; lx += 0.35) {
      const slatGeo = new THREE.BoxGeometry(0.08, 4.8, 0.05);
      const slatMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });
      const slat = new THREE.Mesh(slatGeo, slatMat);
      slat.position.set(lx, 2.5, -2.38);
      scene.add(slat);
    }

    // Cửa sổ kính lớn bên trái đón ánh nắng tự nhiên
    const windowFrameGeo = new THREE.BoxGeometry(0.12, 2.6, 2.2);
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 });
    const windowFrame = new THREE.Mesh(windowFrameGeo, windowFrameMat);
    windowFrame.position.set(-4.5, 2.6, -0.6);
    scene.add(windowFrame);

    const windowGlassGeo = new THREE.BoxGeometry(0.02, 2.4, 2.0);
    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.1,
      transparent: true,
      opacity: 0.4,
    });
    const windowGlass = new THREE.Mesh(windowGlassGeo, windowGlassMat);
    windowGlass.position.set(-4.5, 2.6, -0.6);
    scene.add(windowGlass);

    // Vệt nắng xiên tự nhiên (Sunlight Beam Effect) rọi xuống sàn gỗ
    const sunBeamGeo = new THREE.CylinderGeometry(0.6, 2.0, 4.2, 16);
    const sunBeamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    });
    const sunBeam = new THREE.Mesh(sunBeamGeo, sunBeamMat);
    sunBeam.position.set(-2.6, 1.8, 0.4);
    sunBeam.rotation.z = Math.PI / 4.2;
    sunBeam.rotation.y = -Math.PI / 6;
    scene.add(sunBeam);

    // 2 BỘ BÀN GHẾ CÀ PHÊ PHÒNG (CAPACITY & AMBIENCE)
    // Bộ 1: Phía trước bên trái
    const tableGroup1 = new THREE.Group();
    tableGroup1.position.set(-2.2, 0, 0.9);
    // Mặt bàn tròn
    const tableTopGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.04, 20);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });
    const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
    tableTop.position.set(0, 0.75, 0);
    tableTop.castShadow = true;
    tableGroup1.add(tableTop);
    // Chân bàn
    const tableLegGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.73, 12);
    const tableLeg = new THREE.Mesh(tableLegGeo, tableMat);
    tableLeg.position.set(0, 0.365, 0);
    tableGroup1.add(tableLeg);

    // 2 Ghế gỗ có tựa
    [-0.45, 0.45].forEach((cx) => {
      const chairGroup = new THREE.Group();
      chairGroup.position.set(cx, 0, 0);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.24), tableMat);
      seat.position.set(0, 0.45, 0);
      chairGroup.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.03), tableMat);
      back.position.set(0, 0.6, cx > 0 ? 0.1 : -0.1);
      chairGroup.add(back);
      tableGroup1.add(chairGroup);
    });

    // Ly cafe sứ trên bàn 1
    const tableCup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.03, 0.06, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    tableCup.position.set(0.08, 0.8, 0.05);
    tableGroup1.add(tableCup);

    // Khách hàng Chibi đang ngồi uống cafe ở bàn 1
    const seatedCust = new THREE.Group();
    seatedCust.position.set(-0.45, 0.2, 0);
    const seatedBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.45, 12),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.6 })
    );
    seatedBody.position.set(0, 0.4, 0);
    seatedCust.add(seatedBody);
    const seatedHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.4 })
    );
    seatedHead.position.set(0, 0.72, 0);
    seatedCust.add(seatedHead);
    tableGroup1.add(seatedCust);

    scene.add(tableGroup1);

    // Bộ 2: Phía sau bên phải
    const tableGroup2 = new THREE.Group();
    tableGroup2.position.set(2.4, 0, -0.6);
    const tableTop2 = new THREE.Mesh(tableTopGeo, tableMat);
    tableTop2.position.set(0, 0.75, 0);
    tableGroup2.add(tableTop2);
    const tableLeg2 = new THREE.Mesh(tableLegGeo, tableMat);
    tableLeg2.position.set(0, 0.365, 0);
    tableGroup2.add(tableLeg2);
    scene.add(tableGroup2);

    // Kệ gỗ gắn tường phía sau
    const shelfGeo = new THREE.BoxGeometry(4.5, 0.1, 0.6);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x5a2d12, roughness: 0.5 });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(0, 2.6, -2.2);
    shelf.castShadow = true;
    scene.add(shelf);

    // Chai lọ siro & hộp cafe trang trí trên kệ
    for (let i = -1.8; i <= 1.8; i += 0.6) {
      const bottleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 12);
      const bottleMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xd97706 : 0x059669,
        roughness: 0.2,
        metalness: 0.3,
      });
      const bottle = new THREE.Mesh(bottleGeo, bottleMat);
      bottle.position.set(i, 2.82, -2.2);
      scene.add(bottle);
    }

    // Menu gỗ treo tường
    const boardGeo = new THREE.BoxGeometry(1.6, 1.0, 0.04);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 3.8, -2.35);
    scene.add(board);

    // 4. QUẦY BAR GỖ CHỮ L (WOODEN COUNTER)
    const counterGroup = new THREE.Group();

    // Thân quầy bar
    const counterBaseGeo = new THREE.BoxGeometry(3.6, 1.15, 0.9);
    const counterBaseMat = new THREE.MeshStandardMaterial({
      color: 0x542910,
      roughness: 0.5,
      metalness: 0.1,
    });
    const counterBase = new THREE.Mesh(counterBaseGeo, counterBaseMat);
    counterBase.position.set(0, 0.575, 0);
    counterBase.castShadow = true;
    counterBase.receiveShadow = true;
    counterGroup.add(counterBase);

    // Mặt bàn đá cẩm thạch / gỗ nẹp vàng sáng
    const counterTopGeo = new THREE.BoxGeometry(3.8, 0.1, 1.05);
    const counterTopMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.2,
    });
    const counterTop = new THREE.Mesh(counterTopGeo, counterTopMat);
    counterTop.position.set(0, 1.18, 0);
    counterTop.castShadow = true;
    counterTop.receiveShadow = true;
    counterGroup.add(counterTop);

    // Quầy thu ngân POS tích hợp mã QR thanh toán trên mặt bàn
    const posGroup = new THREE.Group();
    posGroup.position.set(0.35, 1.23, 0.28);
    // Màn hình POS nghiêng
    const posScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.14, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
    );
    posScreen.rotation.x = -Math.PI / 6;
    posScreen.position.set(0, 0.1, 0);
    posGroup.add(posScreen);
    // Bảng đứng mã QR mini
    const qrStand = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.015),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 })
    );
    qrStand.position.set(0.15, 0.04, 0);
    posGroup.add(qrStand);
    counterGroup.add(posGroup);

    scene.add(counterGroup);

    // 5. MÁY PHA ESPRESSO 3D INOX KIM LOẠI (HỖ TRỢ CẤP ĐỘ 1, 2, 3)
    const espressoGroup = new THREE.Group();
    espressoGroup.position.set(-0.8, 1.23, 0);

    const isLvl2 = equipment.espressoMachineLevel >= 2;
    const isLvl3 = equipment.espressoMachineLevel >= 3;

    // Thân máy pha inox
    const machineBodyGeo = new THREE.BoxGeometry(isLvl3 ? 1.05 : 0.9, 0.65, 0.6);
    const machineBodyMat = new THREE.MeshStandardMaterial({
      color: isLvl3 ? 0xf8fafc : 0xe2e8f0,
      metalness: isLvl2 ? 0.95 : 0.85,
      roughness: isLvl2 ? 0.12 : 0.2,
    });
    const machineBody = new THREE.Mesh(machineBodyGeo, machineBodyMat);
    machineBody.position.set(0, 0.325, 0);
    machineBody.castShadow = true;
    espressoGroup.add(machineBody);

    // Nóc máy pha (khay sấy cốc)
    const machineTopGeo = new THREE.BoxGeometry(isLvl3 ? 1.0 : 0.85, 0.05, 0.55);
    const machineTopMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const machineTop = new THREE.Mesh(machineTopGeo, machineTopMat);
    machineTop.position.set(0, 0.67, 0);
    espressoGroup.add(machineTop);

    // Group Heads & Đồng hồ áp suất Manometer
    const headPositions = isLvl3 ? [-0.3, 0, 0.3] : isLvl2 ? [-0.22, 0.22] : [0];
    headPositions.forEach((x) => {
      const groupHeadGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.12, 16);
      const groupHeadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95 });
      const groupHead = new THREE.Mesh(groupHeadGeo, groupHeadMat);
      groupHead.position.set(x, 0.2, 0.25);
      espressoGroup.add(groupHead);

      // Tay cầm Portafilter
      const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.rotation.x = Math.PI / 2;
      handle.position.set(x, 0.16, 0.38);
      espressoGroup.add(handle);
    });

    // Đồng hồ áp suất tròn mặt trước cho máy Lvl 2 & 3
    if (isLvl2) {
      [-0.15, 0.15].forEach((gx) => {
        const gaugeGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16);
        const gaugeMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });
        const gauge = new THREE.Mesh(gaugeGeo, gaugeMat);
        gauge.rotation.x = Math.PI / 2;
        gauge.position.set(gx, 0.45, 0.31);
        espressoGroup.add(gauge);
      });
    }

    // Đèn LED gầm đế máy cho máy Level 3 (Multi-Boiler Pro)
    if (isLvl3) {
      const ledGeo = new THREE.BoxGeometry(1.0, 0.03, 0.03);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0, 0.02, 0.31);
      espressoGroup.add(led);
    }

    // Tách cà phê gốm sứ đang chiết xuất
    const cupGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.1, 16);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.set(-0.2, 0.06, 0.25);
    cup.castShadow = true;
    espressoGroup.add(cup);

    scene.add(espressoGroup);

    // 6. MÁY XAY HẠT CÀ PHÊ (HỖ TRỢ GRINDER LEVEL 2)
    const grinderGroup = new THREE.Group();
    grinderGroup.position.set(-1.45, 1.23, 0);

    const isGrinderPro = equipment.grinderLevel >= 2;
    const grinderBaseGeo = new THREE.CylinderGeometry(isGrinderPro ? 0.16 : 0.14, isGrinderPro ? 0.18 : 0.16, 0.45, 16);
    const grinderBaseMat = new THREE.MeshStandardMaterial({
      color: isGrinderPro ? 0x0f172a : 0x334155,
      metalness: 0.7,
    });
    const grinderBase = new THREE.Mesh(grinderBaseGeo, grinderBaseMat);
    grinderBase.position.set(0, 0.225, 0);
    grinderGroup.add(grinderBase);

    // Màn hình điện tử hiển thị liều lượng (Dosing Display) cho máy xay Pro
    if (isGrinderPro) {
      const displayGeo = new THREE.BoxGeometry(0.12, 0.08, 0.02);
      const displayMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const display = new THREE.Mesh(displayGeo, displayMat);
      display.position.set(0, 0.3, 0.15);
      grinderGroup.add(display);
    }

    // Phễu chứa hạt trong suốt (Hopper)
    const hopperGeo = new THREE.CylinderGeometry(isGrinderPro ? 0.2 : 0.16, 0.08, isGrinderPro ? 0.35 : 0.3, 16);
    const hopperMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const hopper = new THREE.Mesh(hopperGeo, hopperMat);
    hopper.position.set(0, 0.55, 0);
    grinderGroup.add(hopper);

    scene.add(grinderGroup);

    // 6.5. CA ĐÁNH SỮA INOX (MILK FROTHING PITCHER)
    const milkGroup = new THREE.Group();
    milkGroup.position.set(-0.15, 1.23, 0.2);
    const pitcherGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.16, 16);
    const pitcherMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 });
    const pitcher = new THREE.Mesh(pitcherGeo, pitcherMat);
    pitcher.position.set(0, 0.08, 0);
    milkGroup.add(pitcher);
    scene.add(milkGroup);

    // 6.6. TỦ KÍNH BÁNH NGỌT 3 TẦNG (PASTRY CABINET)
    const pastryGroup = new THREE.Group();
    pastryGroup.position.set(1.15, 1.23, 0);
    pastryGroup.visible = Boolean(equipment.pastryCabinet);

    // Khung kính tủ bánh
    const cabinetGlassGeo = new THREE.BoxGeometry(0.7, 0.55, 0.5);
    const cabinetGlassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      transparent: true,
      opacity: 0.45,
    });
    const cabinetGlass = new THREE.Mesh(cabinetGlassGeo, cabinetGlassMat);
    cabinetGlass.position.set(0, 0.275, 0);
    pastryGroup.add(cabinetGlass);

    // Kệ kính bên trong & Bánh sừng bò Croissant
    [-0.1, 0.1].forEach((py) => {
      const shelfP = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.02, 0.45),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2 })
      );
      shelfP.position.set(0, 0.275 + py, 0);
      pastryGroup.add(shelfP);

      // Bánh ngọt tròn vàng
      [-0.18, 0.18].forEach((px) => {
        const pastryItem = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 })
        );
        pastryItem.scale.set(1.4, 0.7, 0.9);
        pastryItem.position.set(px, 0.275 + py + 0.05, 0);
        pastryGroup.add(pastryItem);
      });
    });
    scene.add(pastryGroup);

    // 6.7. BỘ ĐÈN THẢ TRẦN ĐỒNG THAU (AMBIANCE PENDANT LIGHTING)
    const pendantGroup = new THREE.Group();
    pendantGroup.visible = Boolean(equipment.ambianceLighting);
    [-0.7, 0.7].forEach((lx) => {
      // Dây cáp thả trần
      const cordGeo = new THREE.CylinderGeometry(0.008, 0.008, 1.2, 8);
      const cordMat = new THREE.MeshBasicMaterial({ color: 0x1c1917 });
      const cord = new THREE.Mesh(cordGeo, cordMat);
      cord.position.set(lx, 3.2, 0.2);
      pendantGroup.add(cord);

      // Chao đèn nón đồng thau
      const shadeGeo = new THREE.ConeGeometry(0.18, 0.15, 16, 1, true);
      const shadeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });
      const shade = new THREE.Mesh(shadeGeo, shadeMat);
      shade.position.set(lx, 2.55, 0.2);
      pendantGroup.add(shade);

      // Bóng đèn tỏa sáng vàng ấm
      const bulbLight = new THREE.PointLight(0xfef08a, 1.2, 3.5);
      bulbLight.position.set(lx, 2.45, 0.2);
      pendantGroup.add(bulbLight);
    });
    scene.add(pendantGroup);

    // 6.8. VÒNG CHỈ THỊ TRẠM PHA CHẾ XÚC GIÁC (STATION HIGHLIGHT RING)
    const stationRingGeo = new THREE.RingGeometry(0.22, 0.28, 24);
    const stationRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const stationRing = new THREE.Mesh(stationRingGeo, stationRingMat);
    stationRing.rotation.x = -Math.PI / 2;
    stationRing.position.set(-1.45, 1.24, 0);
    stationRing.visible = false;
    scene.add(stationRing);

    // 7. CHẬU CÂY XANH MONSTERA DECOR QUÁN
    const plantGroup = new THREE.Group();
    plantGroup.position.set(1.5, 0, -1.2);
    const potGeo = new THREE.CylinderGeometry(0.25, 0.18, 0.45, 16);
    const potMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(0, 0.225, 0);
    pot.castShadow = true;
    plantGroup.add(pot);

    // Tán lá xanh
    for (let i = 0; i < 5; i++) {
      const leafGeo = new THREE.SphereGeometry(0.28, 8, 8);
      leafGeo.scale(1.2, 0.15, 0.7);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      const angle = (i * Math.PI * 2) / 5;
      leaf.position.set(Math.cos(angle) * 0.2, 0.5 + i * 0.05, Math.sin(angle) * 0.2);
      leaf.rotation.y = angle;
      leaf.rotation.z = 0.35;
      plantGroup.add(leaf);
    }
    scene.add(plantGroup);

    // 8. HỆ HẠT KHÓI HƠI NƯỚC 3D (3D STEAM PARTICLES)
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = -1.0 + (Math.random() - 0.5) * 0.25; // X quanh máy pha
      particlePositions[i * 3 + 1] = 1.35 + Math.random() * 0.9;         // Y dâng lên
      particlePositions[i * 3 + 2] = 0.25 + (Math.random() - 0.5) * 0.25; // Z quanh tách
      particleSpeeds[i] = 0.008 + Math.random() * 0.012;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.09,
      transparent: true,
      opacity: 0.45,
    });
    const steamPoints = new THREE.Points(particleGeo, particleMat);
    scene.add(steamPoints);

    // 9. NHÂN VẬT BARISTA 3D CHIBI (Đứng sau quầy bar)
    const baristaGroup = new THREE.Group();
    baristaGroup.position.set(-0.3, 0, -0.65);

    // Thân áo + tạp dề Barista
    const baristaBodyGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.75, 16);
    const baristaBodyMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    const baristaBody = new THREE.Mesh(baristaBodyGeo, baristaBodyMat);
    baristaBody.position.set(0, 0.75, 0);
    baristaBody.castShadow = true;
    baristaGroup.add(baristaBody);

    // Tạp dề da màu nâu bò
    const apronGeo = new THREE.BoxGeometry(0.32, 0.5, 0.28);
    const apronMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 });
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.position.set(0, 0.72, 0.08);
    baristaGroup.add(apron);

    // Đầu Chibi Barista
    const baristaHeadGeo = new THREE.SphereGeometry(0.26, 20, 20);
    const baristaHeadMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.4 });
    const baristaHead = new THREE.Mesh(baristaHeadGeo, baristaHeadMat);
    baristaHead.position.set(0, 1.32, 0);
    baristaHead.castShadow = true;
    baristaGroup.add(baristaHead);

    // Mũ Beret Barista sành điệu
    const beretGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.1, 16);
    const beretMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });
    const beret = new THREE.Mesh(beretGeo, beretMat);
    beret.position.set(0, 1.5, 0);
    beret.rotation.z = -0.15;
    baristaGroup.add(beret);

    // Mắt Chibi Barista
    [-0.08, 0.08].forEach((x) => {
      const eyeGeo = new THREE.SphereGeometry(0.035, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1c1917 });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, 1.33, 0.24);
      baristaGroup.add(eye);
    });

    // 2 Tay Barista cử động
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 12);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.32, 0.8, 0.1);
    leftArm.rotation.x = Math.PI / 4;
    baristaGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.32, 0.8, 0.1);
    rightArm.rotation.x = Math.PI / 4;
    baristaGroup.add(rightArm);

    scene.add(baristaGroup);

    // 10. NHÂN VẬT KHÁCH HÀNG 3D CHIBI (Đứng trước quầy bar)
    const customerGroup = new THREE.Group();
    customerGroup.position.set(0.6, 0, 0.95);

    // Thân khách hàng
    const custBodyGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.7, 16);
    const custBodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
    const custBody = new THREE.Mesh(custBodyGeo, custBodyMat);
    custBody.position.set(0, 0.7, 0);
    custBody.castShadow = true;
    customerGroup.add(custBody);

    // Đầu khách hàng Chibi
    const custHeadGeo = new THREE.SphereGeometry(0.25, 20, 20);
    const custHeadMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.4 });
    const custHead = new THREE.Mesh(custHeadGeo, custHeadMat);
    custHead.position.set(0, 1.25, 0);
    custHead.castShadow = true;
    customerGroup.add(custHead);

    // Tóc khách hàng Chibi
    const hairGeo = new THREE.SphereGeometry(0.27, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 1.3, 0);
    customerGroup.add(hair);

    // 2 Tay khách hàng
    const custArmGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 12);
    const custArmMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });

    const custLeftArm = new THREE.Mesh(custArmGeo, custArmMat);
    custLeftArm.position.set(-0.28, 0.75, 0);
    customerGroup.add(custLeftArm);

    const custRightArm = new THREE.Mesh(custArmGeo, custArmMat);
    custRightArm.position.set(0.28, 0.75, 0);
    customerGroup.add(custRightArm);

    // Tim 3D khi khách hàng sung sướng (Delighted Heart)
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.1);
    heartShape.bezierCurveTo(0, 0.2, -0.15, 0.35, -0.25, 0.2);
    heartShape.bezierCurveTo(-0.35, 0, 0, -0.2, 0, -0.25);
    heartShape.bezierCurveTo(0, -0.2, 0.35, 0, 0.25, 0.2);
    heartShape.bezierCurveTo(0.15, 0.35, 0, 0.2, 0, 0.1);

    const heartGeo = new THREE.ShapeGeometry(heartShape);
    const heartMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const heart3D = new THREE.Mesh(heartGeo, heartMat);
    heart3D.scale.set(0.6, 0.6, 0.6);
    heart3D.rotation.z = Math.PI;
    heart3D.position.set(0, 1.8, 0);
    heart3D.visible = false;
    customerGroup.add(heart3D);

    scene.add(customerGroup);

    // 11. HŨ TIỀN TIP TRÊN MẶT BÀN GỖ
    const tipJarGroup = new THREE.Group();
    tipJarGroup.position.set(0.85, 1.23, 0.15);
    const tipJarBodyGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.2, 16);
    const tipJarBodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      transparent: true,
      opacity: 0.6,
    });
    const tipJarBody = new THREE.Mesh(tipJarBodyGeo, tipJarBodyMat);
    tipJarBody.position.set(0, 0.1, 0);
    tipJarGroup.add(tipJarBody);
    scene.add(tipJarGroup);

    // 11.2. HỆ THỐNG KHÓI ĐEN SỰ CỐ MÁY PHA (THE BREAKDOWN SMOKE)
    const smokeCount = 35;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePositions[i * 3 + 0] = -1.0 + (Math.random() - 0.5) * 0.4;
      smokePositions[i * 3 + 1] = 1.4 + Math.random() * 0.8;
      smokePositions[i * 3 + 2] = 0.25 + (Math.random() - 0.5) * 0.4;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0x18181b,
      size: 0.16,
      transparent: true,
      opacity: 0.75,
    });
    const blackSmokePoints = new THREE.Points(smokeGeo, smokeMat);
    blackSmokePoints.visible = false;
    scene.add(blackSmokePoints);

    // 11.3. CỜ LÊ SỬA CHỮA KHẨN CẤP (WRENCH REPAIR TOOL)
    const wrenchGroup = new THREE.Group();
    wrenchGroup.position.set(-0.85, 1.4, 0.35);
    const wrenchShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.28, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    wrenchShaft.rotation.z = Math.PI / 4;
    wrenchGroup.add(wrenchShaft);
    const wrenchHead = new THREE.Mesh(
      new THREE.TorusGeometry(0.04, 0.012, 8, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    wrenchHead.position.set(0.1, 0.1, 0);
    wrenchGroup.add(wrenchHead);
    wrenchGroup.visible = false;
    scene.add(wrenchGroup);

    // 11.4. KÉT SẮT VÀNG & PHÁO HOA ĂN MỪNG MỐC 100M VND
    const safeGroup = new THREE.Group();
    safeGroup.position.set(1.15, 1.35, 0.15);
    const safeBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.28, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 })
    );
    safeGroup.add(safeBody);
    const safeDial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 })
    );
    safeDial.rotation.x = Math.PI / 2;
    safeDial.position.set(0, 0, 0.15);
    safeGroup.add(safeDial);
    safeGroup.visible = false;
    scene.add(safeGroup);

    const fireworksCount = 60;
    const fireworksGeo = new THREE.BufferGeometry();
    const fireworksPositions = new Float32Array(fireworksCount * 3);
    for (let i = 0; i < fireworksCount; i++) {
      fireworksPositions[i * 3 + 0] = (Math.random() - 0.5) * 3.0;
      fireworksPositions[i * 3 + 1] = 0.5 + Math.random() * 2.5;
      fireworksPositions[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
    }
    fireworksGeo.setAttribute('position', new THREE.BufferAttribute(fireworksPositions, 3));
    const fireworksMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
    });
    const fireworksPoints = new THREE.Points(fireworksGeo, fireworksMat);
    fireworksPoints.visible = false;
    scene.add(fireworksPoints);

    // 12. ANIMATION TICK RENDER LOOP (60 FPS)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const { baristaAction: bAction, customerAction: cAction, isCrisis: inCrisis } = actionsRef.current;

      // A. Hệ hạt khói bốc lên liên tục
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleSpeeds[i];
        if (positions[i * 3 + 1] > 2.3) {
          positions[i * 3 + 1] = 1.35;
          positions[i * 3 + 0] = -1.0 + (Math.random() - 0.5) * 0.25;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // B. Barista Animation Actions
      if (bAction === 'brewing') {
        // Quay người sang máy pha & giơ tay gạt cần
        baristaGroup.rotation.y = THREE.MathUtils.lerp(baristaGroup.rotation.y, -Math.PI / 4, 0.1);
        leftArm.rotation.x = -Math.PI / 3 + Math.sin(elapsedTime * 8) * 0.25;
        baristaHead.rotation.y = -Math.PI / 6;
      } else if (bAction === 'celebrate') {
        // Nhảy ăn mừng, giơ 2 tay lên cao
        baristaGroup.position.y = Math.abs(Math.sin(elapsedTime * 6)) * 0.15;
        leftArm.rotation.x = -Math.PI / 1.2;
        rightArm.rotation.x = -Math.PI / 1.2;
        baristaGroup.rotation.y = Math.sin(elapsedTime * 4) * 0.2;
      } else {
        // Idle: Đung đưa nhẹ
        baristaGroup.position.y = Math.sin(elapsedTime * 2) * 0.02;
        baristaGroup.rotation.y = THREE.MathUtils.lerp(baristaGroup.rotation.y, 0, 0.05);
        leftArm.rotation.x = Math.PI / 4 + Math.sin(elapsedTime * 2) * 0.08;
        rightArm.rotation.x = Math.PI / 4 - Math.sin(elapsedTime * 2) * 0.08;
        baristaHead.rotation.y = Math.sin(elapsedTime * 1.5) * 0.1;
      }

      // C. Khách Hàng Animation Actions
      const { isBreakdown, isRepairing, celebrate100M } = actionsRef.current;
      
      // Update Breakdown Smoke & Wrench
      blackSmokePoints.visible = isBreakdown;
      wrenchGroup.visible = isRepairing;
      if (isRepairing) {
        wrenchGroup.rotation.z = Math.sin(elapsedTime * 14) * 0.4;
      }

      // Update 100M Celebration
      safeGroup.visible = celebrate100M;
      fireworksPoints.visible = celebrate100M;
      if (celebrate100M) {
        const fPos = fireworksGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < fireworksCount; i++) {
          fPos[i * 3 + 1] += 0.03;
          if (fPos[i * 3 + 1] > 3.5) fPos[i * 3 + 1] = 0.5;
        }
        fireworksGeo.attributes.position.needsUpdate = true;
      }

      if (cAction === 'delighted') {
        // Nhảy cẫng lên và tim 3D xuất hiện
        customerGroup.position.y = Math.abs(Math.sin(elapsedTime * 7)) * 0.18;
        custLeftArm.rotation.x = -Math.PI / 1.4;
        custRightArm.rotation.x = -Math.PI / 1.4;
        heart3D.visible = true;
        heart3D.position.y = 1.8 + Math.sin(elapsedTime * 4) * 0.1;
      } else if (cAction === 'anxious' || inCrisis) {
        // Lo lắng, người rung bần bật, 2 tay ôm đầu
        customerGroup.position.x = 0.6 + (Math.random() - 0.5) * 0.03;
        custLeftArm.rotation.x = -Math.PI / 1.8;
        custRightArm.rotation.x = -Math.PI / 1.8;
        custHead.rotation.z = Math.sin(elapsedTime * 10) * 0.15;
        heart3D.visible = false;
      } else {
        // Waiting: Bình thường
        customerGroup.position.set(0.6, Math.sin(elapsedTime * 2.5) * 0.015, 0.95);
        custLeftArm.rotation.x = THREE.MathUtils.lerp(custLeftArm.rotation.x, 0, 0.1);
        custRightArm.rotation.x = THREE.MathUtils.lerp(custRightArm.rotation.x, 0, 0.1);
        custHead.rotation.set(0, 0, 0);
        heart3D.visible = false;
      }

      // D. Camera Rung Nhẹ khi xảy ra Crisis (Crisis Screen Shake)
      if (inCrisis) {
        camera.position.x = (Math.random() - 0.5) * 0.04;
        camera.position.y = 3.8 + (Math.random() - 0.5) * 0.04;
      } else {
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.1);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3.8, 0.1);
      }

      // E. Vòng Chỉ Thị Trạm Xúc Giác Đang Hoạt Động (Work Shift Highlight)
      const { activeStation: currentActiveStation } = actionsRef.current;
      if (currentActiveStation) {
        stationRing.visible = true;
        stationRing.scale.setScalar(1 + Math.sin(elapsedTime * 6) * 0.1);
        if (currentActiveStation === 'grind') stationRing.position.set(-1.45, 1.24, 0);
        else if (currentActiveStation === 'extract') stationRing.position.set(-0.8, 1.24, 0.25);
        else if (currentActiveStation === 'milk') stationRing.position.set(-0.15, 1.24, 0.2);
      } else {
        stationRing.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 13. RESIZE LISTENER
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 14. CLEANUP WEBGL CONTEXT KHI UNMOUNT (ZERO MEMORY LEAK)
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose Geometries & Materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="coffee-3d-viewport relative overflow-hidden"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '260px',
        maxHeight: '340px',
        position: 'relative',
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65), inset 0 -2px 6px rgba(245, 158, 11, 0.3)',
        borderBottom: '2px solid rgba(217, 119, 6, 0.5)',
        backgroundColor: '#1a0f08',
      }}
    >
      {/* Badge nhỏ góc trên thông báo 3D Scene */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '12px',
          background: 'rgba(0, 0, 0, 0.55)',
          color: '#fde68a',
          padding: '3px 8px',
          borderRadius: '999px',
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.5px',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(253, 230, 138, 0.25)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        ☕ QUÁN CÀ PHÊ 3D LIVE
      </div>
    </div>
  );
};
