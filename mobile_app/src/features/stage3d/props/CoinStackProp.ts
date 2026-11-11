/**
 * PROP 3D: CHỒNG XU TIỀN MẶT CẠNH QUÂN CỜ (COIN STACK PROP)
 * Chiều cao và số lượng đồng xu biến thiên theo số dư tiền mặt của người chơi.
 */

import * as THREE from 'three';

export class CoinStackProp {
  public group: THREE.Group;
  private coins: THREE.Mesh[] = [];
  private maxCoins = 15;
  private coinMat: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.22,
    });

    const coinGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16);

    for (let i = 0; i < this.maxCoins; i++) {
      const coin = new THREE.Mesh(coinGeo, this.coinMat);
      coin.position.set(0, i * 0.035, 0);
      // Xoay góc nhẹ ngẫu nhiên để trông như chồng xu xếp tay thực tế
      coin.rotation.y = (i * 0.35) % Math.PI;
      coin.visible = false;
      this.group.add(coin);
      this.coins.push(coin);
    }
  }

  /**
   * Cập nhật số xu hiển thị và vị trí 3D theo tọa độ quân cờ.
   */
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
