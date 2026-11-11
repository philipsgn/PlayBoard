/**
 * PROP 3D: LÁ CỜ ĐÍCH 90M TRÊN ĐƯỜNG CHÂN TRỜI (GOAL FLAG PROP)
 * Nằm ở góc cao của bàn cờ, biểu thị mục tiêu chiến thắng tài chính.
 * Khi tiến độ đạt >= 90M, cờ phát hào quang vàng rực rỡ và pháo hoa.
 */

import * as THREE from 'three';

export class GoalFlagProp {
  public group: THREE.Group;
  private pole: THREE.Mesh;
  private flag: THREE.Mesh;
  private glowRing: THREE.Mesh;
  private poleMat: THREE.MeshStandardMaterial;
  private flagMat: THREE.MeshStandardMaterial;
  private glowMat: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();

    // 1. Cột cờ kim loại
    const poleGeo = new THREE.CylinderGeometry(0.02, 0.03, 1.2, 12);
    this.poleMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2,
    });
    this.pole = new THREE.Mesh(poleGeo, this.poleMat);
    this.pole.position.set(0, 0.6, 0);
    this.group.add(this.pole);

    // 2. Lá cờ tam giác đỏ - vàng
    const flagShape = new THREE.Shape();
    flagShape.moveTo(0, 0);
    flagShape.lineTo(0.45, -0.15);
    flagShape.lineTo(0, -0.3);
    flagShape.closePath();

    const flagGeo = new THREE.ShapeGeometry(flagShape);
    this.flagMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.4,
      side: THREE.DoubleSide,
    });
    this.flag = new THREE.Mesh(flagGeo, this.flagMat);
    this.flag.position.set(0.02, 1.15, 0);
    this.group.add(this.flag);

    // 3. Vòng hào quang dưới chân cờ (Glow Ring)
    const glowGeo = new THREE.RingGeometry(0.15, 0.35, 24);
    this.glowMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    this.glowRing = new THREE.Mesh(glowGeo, this.glowMat);
    this.glowRing.rotation.x = -Math.PI / 2;
    this.glowRing.position.set(0, 0.01, 0);
    this.group.add(this.glowRing);
  }

  /**
   * Cập nhật hiệu ứng sóng cờ và hào quang theo tiến độ 90M.
   */
  public update(progressRatio: number, isAchieved: boolean, time: number) {
    // Sóng cờ phất phới nhẹ
    this.flag.rotation.y = Math.sin(time * 3) * 0.25;

    // Hào quang tăng dần theo tỷ lệ tiến độ
    this.glowMat.opacity = 0.2 + progressRatio * 0.65;
    const ringScale = 1.0 + progressRatio * 0.5 + Math.sin(time * 4) * 0.08;
    this.glowRing.scale.set(ringScale, ringScale, ringScale);

    if (isAchieved) {
      this.flagMat.color.setHex(0xf59e0b); // Cờ chuyển vàng chiến thắng
      this.glowMat.color.setHex(0x22c55e); // Hào quang xanh lục phát tài
    } else {
      this.flagMat.color.setHex(0xef4444);
      this.glowMat.color.setHex(0xfbbf24);
    }
  }

  public setPosition(x: number, y: number, z: number = 0) {
    this.group.position.set(x, y, z);
  }

  public dispose() {
    this.pole.geometry.dispose();
    this.flag.geometry.dispose();
    this.glowRing.geometry.dispose();
    this.poleMat.dispose();
    this.flagMat.dispose();
    this.glowMat.dispose();
  }
}
