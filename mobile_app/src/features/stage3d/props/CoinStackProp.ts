/**
 * PROP 3D: CHỒNG XU TIỀN MẶT CẠNH QUÂN CỜ (COIN STACK PROP)
 * Vật liệu vàng sáng ấm (không bị đen khi thiếu envMap) và kích thước gọn gàng.
 */

import * as THREE from 'three';

export class CoinStackProp {
  public group: THREE.Group;
  private coins: THREE.Mesh[] = [];
  private maxCoins = 12;
  private coinMat: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.25,
      roughness: 0.35,
      emissive: 0xd97706,
      emissiveIntensity: 0.28,
    });

    const coinGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.022, 18);

    for (let i = 0; i < this.maxCoins; i++) {
      const coin = new THREE.Mesh(coinGeo, this.coinMat);
      coin.position.set(0, i * 0.026, 0);
      coin.rotation.y = (i * 0.35) % Math.PI;
      coin.visible = false;
      this.group.add(coin);
      this.coins.push(coin);
    }
  }

  public update(coinCount: number, x: number, y: number, z: number = 0) {
    this.group.position.set(x, y, z);

    const activeCount = Math.min(this.maxCoins, Math.max(1, coinCount));
    for (let i = 0; i < this.maxCoins; i++) {
      this.coins[i].visible = i < activeCount;
    }
  }

  public dispose() {
    this.coins.forEach((c) => {
      c.geometry.dispose();
    });
    this.coinMat.dispose();
  }
}
