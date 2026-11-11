import * as THREE from 'three';

export class CafeEnvironment {
  public group: THREE.Group;
  public cutawayGroup: THREE.Group;
  public doorPivot: THREE.Group;
  public signMesh: THREE.Mesh;
  public espressoMachine: THREE.Group;
  public grinder: THREE.Group;
  public cashSafe: THREE.Group;

  private cutawayMaterials: THREE.MeshStandardMaterial[] = [];
  private currentDoorAngle = 0;
  private targetDoorAngle = 0;
  private currentSignAngle = 0;
  private targetSignAngle = 0; // 0 = CLOSED, PI = OPEN

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'CafeEnvironment_Group';

    this.cutawayGroup = new THREE.Group();
    this.cutawayGroup.name = 'Cutaway_Group';
    this.group.add(this.cutawayGroup);

    // 1. SÀN GỖ SỒI & VỈA HÈ
    // 1.1 Sàn gỗ sồi sáng bên trong quán (Z < 1.0)
    const interiorFloorGeo = new THREE.PlaneGeometry(7.2, 5.0);
    const interiorFloorMat = new THREE.MeshStandardMaterial({
      color: 0xd4a373, // Gỗ sồi sáng ấm Scandinavian
      roughness: 0.6,
      metalness: 0.05,
    });
    const interiorFloor = new THREE.Mesh(interiorFloorGeo, interiorFloorMat);
    interiorFloor.rotation.x = -Math.PI / 2;
    interiorFloor.position.set(0, 0, -1.5);
    this.group.add(interiorFloor);

    // 1.2 Vỉa hè lát đá xám ngoài quán (Z >= 1.0)
    const streetFloorGeo = new THREE.PlaneGeometry(14.0, 5.0);
    const streetFloorMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Đá vỉa hè xám nhạt
      roughness: 0.85,
    });
    const streetFloor = new THREE.Mesh(streetFloorGeo, streetFloorMat);
    streetFloor.rotation.x = -Math.PI / 2;
    streetFloor.position.set(0, -0.01, 3.5);
    this.group.add(streetFloor);

    // 2. CÁC BỨC TƯỜNG NỘI THẤT CỐ ĐỊNH (Tường sau & tường hông)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Trắng kem Scandinavian mờ
      roughness: 0.8,
    });
    // Tường sau
    const backWallGeo = new THREE.BoxGeometry(7.2, 3.2, 0.2);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 1.6, -4.0);
    this.group.add(backWall);

    // Lam gỗ ốp tường sau
    const woodPanelGeo = new THREE.BoxGeometry(7.0, 1.2, 0.05);
    const woodPanelMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.5 });
    const woodPanel = new THREE.Mesh(woodPanelGeo, woodPanelMat);
    woodPanel.position.set(0, 0.6, -3.88);
    this.group.add(woodPanel);

    // Tường hông trái (có khung cửa sổ đón nắng mai)
    const leftWallGeo = new THREE.BoxGeometry(0.2, 3.2, 5.0);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-3.6, 1.6, -1.5);
    this.group.add(leftWall);

    // Tường hông phải
    const rightWall = new THREE.Mesh(leftWallGeo, wallMat);
    rightWall.position.set(3.6, 1.6, -1.5);
    this.group.add(rightWall);

    // 3. TƯỜNG TRƯỚC VÀ MÁI CẮT LỚP (PROXIMITY CUTAWAY GROUP)
    // Vật liệu hỗ trợ trong suốt để mờ dần khi nhân vật bước vào quán
    const cutawayWallMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.7,
      transparent: true,
      opacity: 1.0,
    });
    this.cutawayMaterials.push(cutawayWallMat);

    // Mảng tường trước bên trái cửa (X: -3.6 -> -0.6)
    const frontWallLeftGeo = new THREE.BoxGeometry(3.0, 3.2, 0.2);
    const frontWallLeft = new THREE.Mesh(frontWallLeftGeo, cutawayWallMat);
    frontWallLeft.position.set(-2.1, 1.6, 1.0);
    this.cutawayGroup.add(frontWallLeft);

    // Mảng tường trước bên phải cửa (X: 0.6 -> 3.6)
    const frontWallRight = new THREE.Mesh(frontWallLeftGeo, cutawayWallMat);
    frontWallRight.position.set(2.1, 1.6, 1.0);
    this.cutawayGroup.add(frontWallRight);

    // Ô thoáng phía trên cửa
    const transomGeo = new THREE.BoxGeometry(1.2, 0.9, 0.2);
    const transom = new THREE.Mesh(transomGeo, cutawayWallMat);
    transom.position.set(0, 2.75, 1.0);
    this.cutawayGroup.add(transom);

    // Mái hiên che nắng màu kem
    const awningMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Màu nâu cafe ấm
      roughness: 0.9,
      transparent: true,
      opacity: 1.0,
    });
    this.cutawayMaterials.push(awningMat);
    const awningGeo = new THREE.BoxGeometry(7.4, 0.15, 1.5);
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 3.1, 1.7);
    awning.rotation.x = 0.25; // Nghiêng dốc nhẹ
    this.cutawayGroup.add(awning);

    // 4. CỬA BẢN LỀ XOAY 90° & BIỂN HIỆU HAI MẶT OPEN/CLOSED
    // Tạo trục xoay tại mép cửa bên trái (X = -0.55, Z = 1.0)
    this.doorPivot = new THREE.Group();
    this.doorPivot.position.set(-0.55, 0, 1.0);
    this.group.add(this.doorPivot);

    // Cánh cửa kính viền gỗ sồi
    const doorFrameGeo = new THREE.BoxGeometry(1.05, 2.25, 0.06);
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
    const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
    doorFrame.position.set(0.525, 1.125, 0); // Đẩy tâm hình học sang phải trục xoay
    this.doorPivot.add(doorFrame);

    // Kính cửa trong suốt
    const doorGlassGeo = new THREE.PlaneGeometry(0.85, 1.8);
    const doorGlassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const doorGlass = new THREE.Mesh(doorGlassGeo, doorGlassMat);
    doorGlass.position.set(0.525, 1.125, 0.01);
    this.doorPivot.add(doorGlass);

    // Tay nắm cửa bằng đồng thau
    const handleGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.35);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0.95, 1.05, 0.06);
    this.doorPivot.add(handle);

    // Biển hiệu gỗ 2 mặt treo trên kính cửa (Mặt trước: CLOSED, Mặt sau: OPEN)
    const signGeo = new THREE.BoxGeometry(0.35, 0.18, 0.02);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    this.signMesh = new THREE.Mesh(signGeo, signMat);
    this.signMesh.position.set(0.525, 1.45, 0.04);
    this.doorPivot.add(this.signMesh);

    // 5. QUẦY BAR TRUNG TÂM (CENTRAL COUNTER)
    const counterGroup = new THREE.Group();
    // Thân quầy gỗ
    const counterBaseGeo = new THREE.BoxGeometry(3.6, 0.92, 0.95);
    const counterBaseMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
    const counterBase = new THREE.Mesh(counterBaseGeo, counterBaseMat);
    counterBase.position.set(0, 0.46, -1.8);
    counterGroup.add(counterBase);

    // Mặt đá mài Terrazzo sáng
    const counterTopGeo = new THREE.BoxGeometry(3.75, 0.08, 1.05);
    const counterTopMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.05 });
    const counterTop = new THREE.Mesh(counterTopGeo, counterTopMat);
    counterTop.position.set(0, 0.96, -1.8);
    counterGroup.add(counterTop);
    this.group.add(counterGroup);

    // 6. THIẾT BỊ CỐT LÕI (CORE EQUIPMENT)
    // 6.1 Máy pha cà phê Espresso Ý Pro 2 Group bằng Inox PBR
    this.espressoMachine = new THREE.Group();
    const machineBodyGeo = new THREE.BoxGeometry(0.72, 0.48, 0.48);
    const inoxMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    });
    const machineBody = new THREE.Mesh(machineBodyGeo, inoxMat);
    this.espressoMachine.add(machineBody);

    // 2 vòi chiết xuất cafe
    const spoutGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.12, 12);
    const spout1 = new THREE.Mesh(spoutGeo, inoxMat);
    spout1.position.set(-0.16, -0.22, 0.18);
    this.espressoMachine.add(spout1);
    const spout2 = new THREE.Mesh(spoutGeo, inoxMat);
    spout2.position.set(0.16, -0.22, 0.18);
    this.espressoMachine.add(spout2);

    this.espressoMachine.position.set(-1.1, 1.25, -1.8);
    this.group.add(this.espressoMachine);

    // 6.2 Máy xay cà phê (Coffee Grinder)
    this.grinder = new THREE.Group();
    const grinderBaseGeo = new THREE.BoxGeometry(0.24, 0.35, 0.28);
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
    const grinderBase = new THREE.Mesh(grinderBaseGeo, blackMat);
    this.grinder.add(grinderBase);

    // Phễu chứa hạt cafe thủy tinh
    const hopperGeo = new THREE.ConeGeometry(0.14, 0.25, 16);
    const glassHopperMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.2,
      transparent: true,
      opacity: 0.75,
    });
    const hopper = new THREE.Mesh(hopperGeo, glassHopperMat);
    hopper.rotation.x = Math.PI;
    hopper.position.set(0, 0.28, 0);
    this.grinder.add(hopper);

    this.grinder.position.set(-1.8, 1.18, -1.8);
    this.group.add(this.grinder);

    // 6.3 Két sắt tiền mặt & doanh thu (Cash Safe)
    this.cashSafe = new THREE.Group();
    const safeBodyGeo = new THREE.BoxGeometry(0.5, 0.55, 0.45);
    const safeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 });
    const safeBody = new THREE.Mesh(safeBodyGeo, safeMat);
    this.cashSafe.add(safeBody);

    const safeDialGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const safeDial = new THREE.Mesh(safeDialGeo, dialMat);
    safeDial.rotation.x = Math.PI / 2;
    safeDial.position.set(0.1, 0, 0.24);
    this.cashSafe.add(safeDial);

    this.cashSafe.position.set(2.2, 0.28, -2.5);
    this.group.add(this.cashSafe);

    // 7. MẢNG XANH BIOPHILIC (MONSTERA, TRẦU BÀ RỦ, CHẬU CÂY)
    this.buildBiophilicGreenery();

    // 8. BÀN GHẾ KHÁCH NỘI THẤT
    this.buildCustomerTables();
  }

  private buildBiophilicGreenery(): void {
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Xanh lá cây tươi đậm
      roughness: 0.4,
      side: THREE.DoubleSide,
    });
    const potMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });

    // 7.1 Chậu cây Monstera lớn góc cửa sổ đón nắng (X = -3.0, Z = 0.4)
    const monsteraGroup = new THREE.Group();
    const potGeo = new THREE.CylinderGeometry(0.28, 0.2, 0.45, 16);
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.225;
    monsteraGroup.add(pot);

    // 5 phiến lá xẻ Monstera xếp tự nhiên
    for (let i = 0; i < 5; i++) {
      const leafGeo = new THREE.PlaneGeometry(0.35, 0.48);
      const leaf = new THREE.Mesh(leafGeo, foliageMat);
      const angle = (i * Math.PI * 2) / 5;
      leaf.position.set(Math.cos(angle) * 0.22, 0.45 + i * 0.08, Math.sin(angle) * 0.22);
      leaf.rotation.x = -0.5;
      leaf.rotation.y = angle;
      monsteraGroup.add(leaf);
    }
    monsteraGroup.position.set(-2.8, 0, 0.4);
    this.group.add(monsteraGroup);

    // 7.2 Chậu cây trầu bà rủ trên kệ (Pothos có chậu và vòm lá tròn, không dùng que rủ thô)
    const pothosGroup = new THREE.Group();
    const shelfPotGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.16, 12);
    const shelfPot = new THREE.Mesh(shelfPotGeo, potMat);
    shelfPot.position.set(0.8, 2.12, -3.8);
    pothosGroup.add(shelfPot);

    const foliageClusterGeo = new THREE.DodecahedronGeometry(0.2, 1);
    const foliageCluster = new THREE.Mesh(foliageClusterGeo, foliageMat);
    foliageCluster.position.set(0.8, 2.25, -3.8);
    pothosGroup.add(foliageCluster);
    this.group.add(pothosGroup);

    // 7.3 Chậu cây bàng cảnh góc phải (Ficus)
    const ficusGroup = new THREE.Group();
    const ficusPot = new THREE.Mesh(potGeo, potMat);
    ficusPot.position.y = 0.225;
    ficusGroup.add(ficusPot);

    const trunkGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.2, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.8;
    ficusGroup.add(trunk);

    const crownGeo = new THREE.DodecahedronGeometry(0.42, 1);
    const crown = new THREE.Mesh(crownGeo, foliageMat);
    crown.position.y = 1.35;
    ficusGroup.add(crown);

    ficusGroup.position.set(2.9, 0, -0.6);
    this.group.add(ficusGroup);
  }

  private buildCustomerTables(): void {
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.4 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });

    // Bàn tròn số 1 (X = -2.0, Z = -0.8)
    const table1 = this.createRoundTable(tableMat, legMat);
    table1.position.set(-2.0, 0, -0.8);
    this.group.add(table1);

    // Bàn tròn số 2 (X = 2.0, Z = -0.8)
    const table2 = this.createRoundTable(tableMat, legMat);
    table2.position.set(2.0, 0, -0.8);
    this.group.add(table2);
  }

  private createRoundTable(topMat: THREE.Material, legMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const topGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.04, 24);
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 0.72;
    group.add(top);

    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 12);
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.y = 0.35;
    group.add(leg);

    const baseGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.02, 24);
    const base = new THREE.Mesh(baseGeo, legMat);
    base.position.y = 0.01;
    group.add(base);

    return group;
  }

  // Điều khiển xoay cửa 90° (0 = Đóng, 1.48 rad = Mở toang)
  public setDoorOpen(isOpen: boolean): void {
    this.targetDoorAngle = isOpen ? 1.48 : 0;
  }

  // Lật biển hiệu OPEN / CLOSED
  public setSignOpen(isOpen: boolean): void {
    this.targetSignAngle = isOpen ? Math.PI : 0;
  }

  // Cơ chế Cắt Lớp Tường: Tự động mờ khi nhân vật tiến sát hoặc bước vào trong quán
  public updateCutaway(characterZ: number): void {
    const isInsideOrClose = characterZ < 1.35;
    const targetOpacity = isInsideOrClose ? 0.08 : 1.0;

    for (const mat of this.cutawayMaterials) {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.14);
      mat.depthWrite = mat.opacity > 0.45;
    }
  }

  public update(delta: number): void {
    // Lerp góc quay cánh cửa mượt mà
    if (Math.abs(this.currentDoorAngle - this.targetDoorAngle) > 0.005) {
      this.currentDoorAngle = THREE.MathUtils.lerp(this.currentDoorAngle, this.targetDoorAngle, delta * 6.0);
      this.doorPivot.rotation.y = this.currentDoorAngle;
    }

    // Lerp lật biển hiệu
    if (Math.abs(this.currentSignAngle - this.targetSignAngle) > 0.005) {
      this.currentSignAngle = THREE.MathUtils.lerp(this.currentSignAngle, this.targetSignAngle, delta * 8.0);
      this.signMesh.rotation.y = this.currentSignAngle;
    }
  }

  public dispose(): void {
    this.group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose();
        }
      }
    });
  }
}
