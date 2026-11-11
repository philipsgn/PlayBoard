import * as THREE from 'three';

export type CameraPreset = 'OVERVIEW' | 'FOLLOW_WALK' | 'BARISTA_ACTION' | 'CRISIS_DRAMA';

export class CameraDirector {
  public camera: THREE.PerspectiveCamera;
  private currentPreset: CameraPreset = 'FOLLOW_WALK';

  private currentPos = new THREE.Vector3(0, 5, 8);
  private targetPos = new THREE.Vector3(0, 5, 8);
  private currentLookAt = new THREE.Vector3(0, 0.9, 0);
  private targetLookAt = new THREE.Vector3(0, 0.9, 0);

  // Khoảng cách tối thiểu bắt buộc theo 05_TECH_SPEC_CAFE3D_SOLO.md (chống đâm xuyên nhân vật & tường)
  private readonly minDistance = 3.2;

  constructor(width: number, height: number) {
    const aspect = width / height;
    // FOV chuẩn 38° điện ảnh, nhân vật chiếm tối đa ~30-35% chiều cao khung hình
    const baseFov = aspect < 0.5 ? 42 : 38;
    this.camera = new THREE.PerspectiveCamera(baseFov, aspect, 0.1, 100);
    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLookAt);
  }

  public setPreset(preset: CameraPreset): void {
    this.currentPreset = preset;
  }

  public resize(width: number, height: number): void {
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 0.5 ? 42 : 38;
    this.camera.updateProjectionMatrix();
  }

  public update(delta: number, characterPos: THREE.Vector3): void {
    switch (this.currentPreset) {
      case 'OVERVIEW':
        // Toàn cảnh Dollhouse nhìn từ trên cao xuống 30°
        this.targetPos.set(0.0, 6.8, 8.5);
        this.targetLookAt.set(0.0, 0.8, -0.5);
        break;

      case 'FOLLOW_WALK':
        // Góc nhìn Dollhouse chúc 30°, cách xa 4.2m và cao 3.2m (không bao giờ che mặt/gáy)
        this.targetPos.set(
          characterPos.x * 0.35,
          Math.max(characterPos.y + 3.2, 3.0),
          characterPos.z + 4.2
        );
        this.targetLookAt.set(characterPos.x, characterPos.y + 0.85, characterPos.z);
        break;

      case 'BARISTA_ACTION':
        // Góc quầy bar ngập nắng, nhìn rõ bàn tay và máy pha
        this.targetPos.set(0.0, 3.4, 2.6);
        this.targetLookAt.set(0.0, 0.95, -1.8);
        break;

      case 'CRISIS_DRAMA':
        // Góc kịch tính nhưng vẫn đảm bảo khoảng cách an toàn >= 3.2m
        this.targetPos.set(characterPos.x + 0.8, characterPos.y + 2.5, characterPos.z + 3.2);
        this.targetLookAt.set(characterPos.x, characterPos.y + 1.15, characterPos.z);
        break;
    }

    // Bảo đảm khoảng cách tối thiểu tuyệt đối không vi phạm minDistance
    const diff = this.targetPos.clone().sub(this.targetLookAt);
    if (diff.length() < this.minDistance) {
      diff.setLength(this.minDistance);
      this.targetPos.copy(this.targetLookAt).add(diff);
    }

    // Damped Exponential Lerp mượt mà
    const lerpFactor = Math.min(delta * 5.0, 0.25);
    this.currentPos.lerp(this.targetPos, lerpFactor);
    this.currentLookAt.lerp(this.targetLookAt, lerpFactor);

    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLookAt);
  }
}
