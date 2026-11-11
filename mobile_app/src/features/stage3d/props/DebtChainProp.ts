/**
 * PROP 3D: DÂY XÍCH NỢ VAY NEO CHÂN QUÂN CỜ (DEBT CHAIN PROP)
 * Số lượng mắt xích tỷ lệ với % nợ vay.
 * Khi nợ >= 25M (sát trần 30M), xích chuyển sang màu đỏ rực cảnh báo nguy cấp.
 */

import * as THREE from 'three';

export class DebtChainProp {
  public group: THREE.Group;
  private links: THREE.Mesh[] = [];
  private maxLinks = 10;
  private normalMat: THREE.MeshStandardMaterial;
  private criticalMat: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    this.normalMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.9,
      roughness: 0.28,
    });

    this.criticalMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.6,
      metalness: 0.85,
      roughness: 0.2,
    });

    const linkGeo = new THREE.TorusGeometry(0.045, 0.012, 8, 16);

    for (let i = 0; i < this.maxLinks; i++) {
      const link = new THREE.Mesh(linkGeo, this.normalMat);
      // Xếp các mắt xích đan xen 90 độ
      link.position.set(0, i * 0.05, 0);
      link.rotation.y = i % 2 === 0 ? 0 : Math.PI / 2;
      link.visible = false;
      this.group.add(link);
      this.links.push(link);
    }
  }

  /**
   * Cập nhật số mắt xích và trạng thái màu sắc cảnh báo rủi ro.
   */
  public update(chainCount: number, isCritical: boolean, x: number, y: number, z: number = 0) {
    this.group.position.set(x, y, z);

    const activeLinks = Math.min(this.maxLinks, Math.max(0, chainCount));
    const activeMat = isCritical ? this.criticalMat : this.normalMat;

    for (let i = 0; i < this.maxLinks; i++) {
      const isVisible = i < activeLinks;
      this.links[i].visible = isVisible;
      if (isVisible) {
        this.links[i].material = activeMat;
      }
    }
  }

  public dispose() {
    this.links.forEach((l) => {
      l.geometry.dispose();
    });
    this.normalMat.dispose();
    this.criticalMat.dispose();
  }
}
