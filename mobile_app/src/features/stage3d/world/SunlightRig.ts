import * as THREE from 'three';

export class SunlightRig {
  public group: THREE.Group;
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private godrayMesh: THREE.Mesh;
  private dustPoints: THREE.Points;
  private dustGeo: THREE.BufferGeometry;
  private dustPositions: Float32Array;
  private dustCount = 40;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'SunlightRig_Group';

    // 1. Ánh sáng môi trường hai màu (Bầu trời xanh ngọc nhạt & Sàn phản chiếu ấm)
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xfef3c7, 0.7);
    this.group.add(this.hemiLight);

    // 2. Nắng mai vàng ấm chiếu xiên góc ~42°
    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 1.75);
    this.sunLight.position.set(-4.0, 5.5, 3.5);
    this.sunLight.target.position.set(0.0, 1.0, -1.5);
    this.group.add(this.sunLight);
    this.group.add(this.sunLight.target);

    // 3. Vệt nắng xiên hình nón cụt (Volumetric Godray / Light Shaft)
    const beamGeo = new THREE.CylinderGeometry(0.4, 2.4, 6.0, 16, 1, true);
    beamGeo.translate(0, -3.0, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.godrayMesh = new THREE.Mesh(beamGeo, beamMat);
    this.godrayMesh.position.set(-3.5, 5.2, 3.0);
    this.godrayMesh.lookAt(0.0, 0.8, -1.5);
    this.godrayMesh.rotateX(Math.PI / 2);
    this.group.add(this.godrayMesh);

    // 4. Hạt bụi nắng vàng li ti lơ lửng trong không gian quán (Sun Dust Motes)
    this.dustGeo = new THREE.BufferGeometry();
    this.dustPositions = new Float32Array(this.dustCount * 3);
    for (let i = 0; i < this.dustCount; i++) {
      this.dustPositions[i * 3 + 0] = (Math.random() - 0.5) * 5.0;
      this.dustPositions[i * 3 + 1] = Math.random() * 3.0 + 0.2;
      this.dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 4.0 - 1.0;
    }
    this.dustGeo.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));

    const dustMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.05,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.dustPoints = new THREE.Points(this.dustGeo, dustMat);
    this.group.add(this.dustPoints);
  }

  public update(time: number, isReducedMotion = false): void {
    if (isReducedMotion) return;

    // Hiệu ứng thở nhẹ của vệt nắng
    const beamMat = this.godrayMesh.material as THREE.MeshBasicMaterial;
    beamMat.opacity = 0.14 + Math.sin(time * 1.5) * 0.03;

    // Chuyển động Brown nhẹ của các hạt bụi nắng
    const pos = this.dustPositions;
    for (let i = 0; i < this.dustCount; i++) {
      pos[i * 3 + 1] += 0.002 * Math.sin(time + i);
      pos[i * 3 + 0] += 0.001 * Math.cos(time * 0.8 + i);
      if (pos[i * 3 + 1] > 3.2) pos[i * 3 + 1] = 0.3;
      if (pos[i * 3 + 1] < 0.2) pos[i * 3 + 1] = 3.1;
    }
    this.dustGeo.attributes.position.needsUpdate = true;
  }

  public dispose(): void {
    this.godrayMesh.geometry.dispose();
    (this.godrayMesh.material as THREE.Material).dispose();
    this.dustGeo.dispose();
    (this.dustPoints.material as THREE.Material).dispose();
  }
}
