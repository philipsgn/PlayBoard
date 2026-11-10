import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type Barista3DAction = 'idle' | 'brewing' | 'celebrate';
export type Customer3DAction = 'waiting' | 'delighted' | 'anxious';

interface CoffeeShop3DViewProps {
  baristaAction?: Barista3DAction;
  customerAction?: Customer3DAction;
  isCrisis?: boolean;
}

export const CoffeeShop3DView: React.FC<CoffeeShop3DViewProps> = ({
  baristaAction = 'idle',
  customerAction = 'waiting',
  isCrisis = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef({ baristaAction, customerAction, isCrisis });

  // Update refs on prop change for animation loop
  useEffect(() => {
    actionsRef.current = { baristaAction, customerAction, isCrisis };
  }, [baristaAction, customerAction, isCrisis]);

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

    scene.add(counterGroup);

    // 5. MÁY PHA ESPRESSO 3D INOX KIM LOẠI
    const espressoGroup = new THREE.Group();
    espressoGroup.position.set(-0.8, 1.23, 0);

    // Thân máy pha inox
    const machineBodyGeo = new THREE.BoxGeometry(0.9, 0.65, 0.6);
    const machineBodyMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.85,
      roughness: 0.2,
    });
    const machineBody = new THREE.Mesh(machineBodyGeo, machineBodyMat);
    machineBody.position.set(0, 0.325, 0);
    machineBody.castShadow = true;
    espressoGroup.add(machineBody);

    // Nóc máy pha (khay sấy cốc)
    const machineTopGeo = new THREE.BoxGeometry(0.85, 0.05, 0.55);
    const machineTopMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const machineTop = new THREE.Mesh(machineTopGeo, machineTopMat);
    machineTop.position.set(0, 0.67, 0);
    espressoGroup.add(machineTop);

    // 2 Group Heads (Đầu chiết xuất)
    [-0.2, 0.2].forEach((x) => {
      const groupHeadGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.12, 16);
      const groupHeadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
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

    // Tách cà phê gốm sứ đang chiết xuất
    const cupGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.1, 16);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.set(-0.2, 0.06, 0.25);
    cup.castShadow = true;
    espressoGroup.add(cup);

    scene.add(espressoGroup);

    // 6. MÁY XAY HẠT CÀ PHÊ (COFFEE GRINDER)
    const grinderGroup = new THREE.Group();
    grinderGroup.position.set(-1.45, 1.23, 0);
    const grinderBaseGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.45, 16);
    const grinderBaseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
    const grinderBase = new THREE.Mesh(grinderBaseGeo, grinderBaseMat);
    grinderBase.position.set(0, 0.225, 0);
    grinderGroup.add(grinderBase);

    // Phễu chứa hạt trong suốt (Hopper)
    const hopperGeo = new THREE.CylinderGeometry(0.16, 0.08, 0.3, 16);
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
