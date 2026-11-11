import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { assetUrl } from '../../../utils/assets';

export class BaristaCharacter {
  public group: THREE.Group;
  public position: THREE.Vector3;
  private mixer: THREE.AnimationMixer | null = null;
  private animations = new Map<string, THREE.AnimationAction>();
  private currentAction: THREE.AnimationAction | null = null;

  // Sockets gắn vật phẩm cầm tay
  public rightHandSocket: THREE.Group;
  public leftHandSocket: THREE.Group;

  // Các props 3D có sẵn
  private props = new Map<string, THREE.Object3D>();
  private proceduralModel: THREE.Group | null = null;
  private glbModel: THREE.Object3D | null = null;

  // Thuộc tính di chuyển
  private path: THREE.Vector3[] = [];
  private currentPathIndex = 0;
  private moveSpeed = 2.8; // Mét / giây
  public isMoving = false;
  private onReachDestination: (() => void) | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'BaristaCharacter_Group';
    this.position = this.group.position;

    // Sockets gắn prop vào 2 tay
    this.rightHandSocket = new THREE.Group();
    this.rightHandSocket.position.set(0.35, 1.0, 0.2);
    this.group.add(this.rightHandSocket);

    this.leftHandSocket = new THREE.Group();
    this.leftHandSocket.position.set(-0.35, 1.0, 0.2);
    this.group.add(this.leftHandSocket);

    // Khởi tạo các Props cầm tay
    this.initProps();

    // Dựng nhân vật Procedural Barista (Áo sơ mi xắn tay + Tạp dề nâu) hiển thị tức thì 0ms
    this.buildProceduralBarista();

    // Tải mô hình GLB thật từ character.glb nền ngầm
    this.loadGLBModel();
  }

  private buildProceduralBarista(): void {
    this.proceduralModel = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x271c19, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }); // Áo sơ mi trắng ngà
    const apronMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 }); // Tạp dề Barista nâu
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 }); // Quần âu xám
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 });

    // Đầu & Tóc
    const headGeo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.62;
    this.proceduralModel.add(head);

    const hairGeo = new THREE.BoxGeometry(0.3, 0.12, 0.3);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 1.74, -0.01);
    this.proceduralModel.add(hair);

    // Thân áo sơ mi
    const torsoGeo = new THREE.BoxGeometry(0.38, 0.52, 0.24);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 1.22;
    this.proceduralModel.add(torso);

    // Tạp dề nâu Barista phía trước
    const apronGeo = new THREE.BoxGeometry(0.39, 0.44, 0.05);
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.position.set(0, 1.18, 0.11);
    this.proceduralModel.add(apron);

    // Dây đeo tạp dề chéo vai
    const strapGeo = new THREE.BoxGeometry(0.39, 0.05, 0.25);
    const strap = new THREE.Mesh(strapGeo, apronMat);
    strap.position.set(0, 1.45, 0);
    this.proceduralModel.add(strap);

    // Hai cánh tay sơ mi xắn tay (khuỷu tay để trần da)
    const armGeo = new THREE.BoxGeometry(0.11, 0.45, 0.11);
    const armL = new THREE.Mesh(armGeo, shirtMat);
    armL.position.set(-0.26, 1.2, 0);
    this.proceduralModel.add(armL);

    const armR = new THREE.Mesh(armGeo, shirtMat);
    armR.position.set(0.26, 1.2, 0);
    this.proceduralModel.add(armR);

    // Hai chân quần âu
    const legGeo = new THREE.BoxGeometry(0.15, 0.65, 0.15);
    const legL = new THREE.Mesh(legGeo, pantsMat);
    legL.position.set(-0.11, 0.55, 0);
    this.proceduralModel.add(legL);

    const legR = new THREE.Mesh(legGeo, pantsMat);
    legR.position.set(0.11, 0.55, 0);
    this.proceduralModel.add(legR);

    // Đôi giày da
    const shoeGeo = new THREE.BoxGeometry(0.16, 0.1, 0.22);
    const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
    shoeL.position.set(-0.11, 0.05, 0.03);
    this.proceduralModel.add(shoeL);

    const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
    shoeR.position.set(0.11, 0.05, 0.03);
    this.proceduralModel.add(shoeR);

    this.group.add(this.proceduralModel);
  }

  private initProps(): void {
    // 1. Điện thoại thông minh (Smartphone)
    const phoneGeo = new THREE.BoxGeometry(0.08, 0.16, 0.01);
    const phoneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const phone = new THREE.Mesh(phoneGeo, phoneMat);
    phone.visible = false;
    this.props.set('phone', phone);
    this.rightHandSocket.add(phone);

    // 2. Tách cà phê sứ nóng (Coffee Cup)
    const cupGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.09, 12);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.visible = false;
    this.props.set('cup', cup);
    this.rightHandSocket.add(cup);

    // 3. Khay gỗ phục vụ (Serving Tray)
    const trayGeo = new THREE.BoxGeometry(0.35, 0.02, 0.25);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.5 });
    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.visible = false;
    this.props.set('tray', tray);
    this.leftHandSocket.add(tray);

    // 4. Chìa khóa cửa quán (Door Key)
    const keyGeo = new THREE.BoxGeometry(0.03, 0.08, 0.01);
    const keyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const key = new THREE.Mesh(keyGeo, keyMat);
    key.visible = false;
    this.props.set('key', key);
    this.rightHandSocket.add(key);

    // 5. Cờ lê sửa máy pha (Wrench)
    const wrenchGeo = new THREE.BoxGeometry(0.04, 0.25, 0.02);
    const wrenchMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const wrench = new THREE.Mesh(wrenchGeo, wrenchMat);
    wrench.visible = false;
    this.props.set('wrench', wrench);
    this.rightHandSocket.add(wrench);

    // 6. Khăn lau quầy (Cleaning Cloth)
    const clothGeo = new THREE.BoxGeometry(0.12, 0.12, 0.03);
    const clothMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.9 });
    const cloth = new THREE.Mesh(clothGeo, clothMat);
    cloth.visible = false;
    this.props.set('cloth', cloth);
    this.rightHandSocket.add(cloth);

    // 7. Xấp tiền mặt VND (Cash Bills)
    const billsGeo = new THREE.BoxGeometry(0.12, 0.06, 0.03);
    const billsMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 });
    const bills = new THREE.Mesh(billsGeo, billsMat);
    bills.visible = false;
    this.props.set('bills', bills);
    this.rightHandSocket.add(bills);
  }

  public setProp(propName: string | null): void {
    // Ẩn tất cả props
    this.props.forEach((p) => (p.visible = false));
    if (propName && this.props.has(propName)) {
      this.props.get(propName)!.visible = true;
    }
  }

  private loadGLBModel(): void {
    const loader = new GLTFLoader();
    loader.load(
      assetUrl('assets/character.glb'),
      (gltf) => {
        this.glbModel = gltf.scene;
        this.glbModel.scale.set(0.9, 0.9, 0.9);

        // Ẩn các mesh vũ khí không liên quan
        const weaponNames = ['Sniper', 'SMG', 'RocketLauncher', 'Revolver', 'Pistol', 'AK', 'Shotgun', 'Shovel', 'Knife_1', 'Knife_2'];
        this.glbModel.traverse((child) => {
          if (child.name && weaponNames.some((w) => child.name.includes(w))) {
            child.visible = false;
          }
        });

        // Khởi tạo AnimationMixer cho 14 clips có sẵn
        this.mixer = new THREE.AnimationMixer(this.glbModel);
        gltf.animations.forEach((clip) => {
          const action = this.mixer!.clipAction(clip);
          this.animations.set(clip.name, action);
        });

        // Ẩn model procedural và đưa model GLB vào thay thế
        if (this.proceduralModel) {
          this.proceduralModel.visible = false;
        }
        this.group.add(this.glbModel);

        // Phát animation Idle mặc định
        this.playAction('CharacterArmature|Idle');
      },
      undefined,
      (err) => {
        console.warn('Could not load character.glb, keeping high-quality procedural Barista mesh:', err);
      }
    );
  }

  public playAction(actionName: string, _duration = 1.0): void {
    // Nếu có clip trong GLB, hòa trộn mượt mà
    const nextAction = this.animations.get(actionName);
    if (nextAction && this.mixer) {
      if (this.currentAction && this.currentAction !== nextAction) {
        this.currentAction.fadeOut(0.2);
      }
      nextAction.reset().fadeIn(0.2).play();
      this.currentAction = nextAction;
      return;
    }

    // Nếu dùng procedural fallback model, diễn hành động bằng xoay góc cơ bản
    if (this.proceduralModel) {
      if (actionName.includes('Wave') || actionName.includes('greet')) {
        this.rightHandSocket.position.set(0.35, 1.45, 0.1);
        this.rightHandSocket.rotation.z = -0.5;
      } else if (actionName.includes('Run') || actionName.includes('walk')) {
        this.rightHandSocket.position.set(0.25, 1.0, 0.1);
        this.rightHandSocket.rotation.z = 0;
      } else {
        this.rightHandSocket.position.set(0.35, 1.0, 0.2);
        this.rightHandSocket.rotation.z = 0;
      }
    }
  }

  // Ra lệnh cho Minh đi theo danh sách các Waypoints
  public followPath(path: THREE.Vector3[], speed = 2.8, onReach?: () => void): void {
    if (!path || path.length === 0) return;
    this.path = path;
    this.currentPathIndex = 0;
    this.moveSpeed = speed;
    this.isMoving = true;
    this.onReachDestination = onReach || null;
    this.playAction('CharacterArmature|Run');
  }

  public update(delta: number): void {
    // Cập nhật AnimationMixer nếu có
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Cập nhật di chuyển theo lộ trình Path
    if (this.isMoving && this.path.length > 0) {
      const target = this.path[this.currentPathIndex];
      const currentPos = this.group.position;

      const dir = new THREE.Vector3().subVectors(target, currentPos);
      const dist = dir.length();

      if (dist < 0.1) {
        // Đã đến waypoint này, chuyển sang waypoint tiếp theo
        this.currentPathIndex++;
        if (this.currentPathIndex >= this.path.length) {
          // Hoàn thành toàn bộ lộ trình
          this.isMoving = false;
          this.playAction('CharacterArmature|Idle');
          if (this.onReachDestination) {
            this.onReachDestination();
            this.onReachDestination = null;
          }
        }
      } else {
        dir.normalize();
        currentPos.addScaledVector(dir, this.moveSpeed * delta);

        // Xoay hướng mặt Minh về phía hướng di chuyển
        const angle = Math.atan2(dir.x, dir.z);
        this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, angle, delta * 12.0);
      }
    }
  }

  public dispose(): void {
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
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
