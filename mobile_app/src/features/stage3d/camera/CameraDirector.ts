import * as THREE from 'three';

export type CameraPreset = 'OVERVIEW' | 'FOLLOW_WALK' | 'BARISTA_ACTION' | 'CRISIS_DRAMA';

export class CameraDirector {
  public camera: THREE.PerspectiveCamera;
  private currentPreset: CameraPreset = 'FOLLOW_WALK';

  private currentPos = new THREE.Vector3(0, 5, 8);
  private targetPos = new THREE.Vector3(0, 5, 8);
  private currentLookAt = new THREE.Vector3(0, 1, 0);
  private targetLookAt = new THREE.Vector3(0, 1, 0);

  constructor(width: number, height: number) {
    const aspect = width / height;
    // Tự động mở rộng FOV nếu màn hình hẹp dài 20:9
    const baseFov = aspect < 0.5 ? 46 : 40;
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
    this.camera.fov = aspect < 0.5 ? 46 : 40;
    this.camera.updateProjectionMatrix();
  }

  public update(delta: number, characterPos: THREE.Vector3): void {
    switch (this.currentPreset) {
      case 'OVERVIEW':
        this.targetPos.set(0.0, 7.5, 9.5);
        this.targetLookAt.set(0.0, 0.5, 0.0);
        break;

      case 'FOLLOW_WALK':
        // Camera theo sau lưng Minh một khoảng 3.5m và cao 2.4m
        this.targetPos.set(
          characterPos.x * 0.5,
          Math.max(characterPos.y + 2.4, 2.2),
          characterPos.z + 3.8
        );
        this.targetLookAt.set(characterPos.x, characterPos.y + 1.25, characterPos.z);
        break;

      case 'BARISTA_ACTION':
        // Góc cận cảnh quầy bar ngập nắng
        this.targetPos.set(0.0, 2.7, 1.8);
        this.targetLookAt.set(0.0, 1.1, -1.9);
        break;

      case 'CRISIS_DRAMA':
        // Góc cận kịch tính biểu cảm khuôn mặt Minh khi có sự cố
        this.targetPos.set(characterPos.x + 0.35, characterPos.y + 1.45, characterPos.z + 1.25);
        this.targetLookAt.set(characterPos.x, characterPos.y + 1.35, characterPos.z);
        break;
    }

    // Damped Exponential Lerp mượt mà
    const lerpFactor = Math.min(delta * 5.0, 0.25);
    this.currentPos.lerp(this.targetPos, lerpFactor);
    this.currentLookAt.lerp(this.targetLookAt, lerpFactor);

    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLookAt);
  }
}
