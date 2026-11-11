/**
 * LIGHTING RIG: ĐIỀU PHỐI ÁNH SÁNG THEO VÒNG CHƠI (4 LAPS DYNAMIC LIGHTING)
 * Biến đổi màu sắc và góc chiếu mặt trời theo chu kỳ 4 Quý năm 2026:
 * - Vòng 1 (Sáng sớm vàng ấm): Khởi đầu hứng khởi.
 * - Vòng 2 (Trưa nắng xanh trong): Tăng tốc tăng trưởng.
 * - Vòng 3 (Chiều tà hoàng hôn): Bất định & quản trị rủi ro.
 * - Vòng 4 (Đêm về đích): Tập trung cao độ chạm 90M.
 */

import * as THREE from 'three';
import type { TimeOfDay } from '../types.ts';

export class LightingRig {
  public group: THREE.Group;
  private ambientLight: THREE.AmbientLight;
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  constructor() {
    this.group = new THREE.Group();

    this.ambientLight = new THREE.AmbientLight(0xffedd5, 0.7);
    this.group.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    this.group.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfef08a, 1.2);
    this.sunLight.position.set(2, 4, 3);
    this.group.add(this.sunLight);
  }

  /**
   * Cập nhật màu sắc và cường độ ánh sáng mượt mà theo thời điểm trong ngày.
   */
  public updateTimeOfDay(timeOfDay: TimeOfDay) {
    switch (timeOfDay) {
      case 'morning':
        // Nắng sớm vàng cam ấm áp
        this.ambientLight.color.setHex(0xffedd5);
        this.ambientLight.intensity = 0.8;
        this.sunLight.color.setHex(0xfef08a);
        this.sunLight.intensity = 1.3;
        this.sunLight.position.set(-2, 3.5, 3);
        break;

      case 'noon':
        // Trưa hè trong trẻo, rực rỡ
        this.ambientLight.color.setHex(0xf0fdf4);
        this.ambientLight.intensity = 0.9;
        this.sunLight.color.setHex(0xffffff);
        this.sunLight.intensity = 1.5;
        this.sunLight.position.set(0, 5, 2);
        break;

      case 'afternoon':
        // Hoàng hôn cam tím lắng đọng
        this.ambientLight.color.setHex(0xfae8ff);
        this.ambientLight.intensity = 0.7;
        this.sunLight.color.setHex(0xf97316);
        this.sunLight.intensity = 1.1;
        this.sunLight.position.set(2.5, 2.5, 2);
        break;

      case 'night':
        // Đêm trăng huyền ảo, xanh thẫm
        this.ambientLight.color.setHex(0x1e1b4b);
        this.ambientLight.intensity = 0.55;
        this.sunLight.color.setHex(0x38bdf8);
        this.sunLight.intensity = 0.85;
        this.sunLight.position.set(-1.5, 4, -1);
        break;
    }
  }

  public dispose() {
    this.ambientLight.dispose();
    this.hemiLight.dispose();
    this.sunLight.dispose();
  }
}
