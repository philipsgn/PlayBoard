import * as THREE from 'three';
import { BaristaCharacter } from '../world/BaristaCharacter';
import { CafeEnvironment } from '../world/CafeEnvironment';
import { CameraDirector } from '../camera/CameraDirector';
import { Pathfinding, WORLD_NODES } from './Pathfinding';

export interface ActionStep {
  do: string;
  target?: string;
  wait?: number;
  props?: string[];
  vfx?: string;
  npc?: string;
}

export interface ActionPlan {
  id: string;
  steps: ActionStep[];
  maxSeconds?: number;
}

export class ActionRunner {
  private character: BaristaCharacter;
  private env: CafeEnvironment;
  private cameraDirector: CameraDirector;
  private pathfinding: Pathfinding;

  private isRunning = false;
  private currentPlan: ActionPlan | null = null;
  private currentStepIndex = 0;
  private stepTimer = 0;
  private speedMultiplier = 1.0;
  private onPlanFinished: (() => void) | null = null;

  constructor(
    character: BaristaCharacter,
    env: CafeEnvironment,
    cameraDirector: CameraDirector,
    pathfinding: Pathfinding
  ) {
    this.character = character;
    this.env = env;
    this.cameraDirector = cameraDirector;
    this.pathfinding = pathfinding;
  }

  public setSpeed(multiplier: number): void {
    this.speedMultiplier = Math.max(0.5, Math.min(multiplier, 4.0));
  }

  public runPlan(plan: ActionPlan, onFinished?: () => void): void {
    this.currentPlan = plan;
    this.currentStepIndex = 0;
    this.stepTimer = 0;
    this.isRunning = true;
    this.onPlanFinished = onFinished || null;

    this.executeCurrentStep();
  }

  public skip(): void {
    if (!this.isRunning || !this.currentPlan) return;

    // Lập tức áp dụng các hệ quả visual cuối cùng
    this.env.setDoorOpen(true);
    this.env.setSignOpen(true);
    this.character.setProp(null);
    this.character.isMoving = false;
    this.character.playAction('CharacterArmature|Idle');

    this.isRunning = false;
    if (this.onPlanFinished) {
      this.onPlanFinished();
      this.onPlanFinished = null;
    }
  }

  private executeCurrentStep(): void {
    if (!this.currentPlan || this.currentStepIndex >= this.currentPlan.steps.length) {
      // Đã chạy hết tất cả các bước
      this.isRunning = false;
      if (this.onPlanFinished) {
        this.onPlanFinished();
        this.onPlanFinished = null;
      }
      return;
    }

    const step = this.currentPlan.steps[this.currentStepIndex];
    this.stepTimer = (step.wait ?? 1.0) / this.speedMultiplier;

    // 1. Gắn / gỡ Prop cầm tay
    if (step.props && step.props.length > 0) {
      this.character.setProp(step.props[0]);
    } else {
      this.character.setProp(null);
    }

    // 2. Tương tác với môi trường quán (Door swing, Lights, Sign flip)
    if (step.do === 'push_door_open' || step.vfx?.includes('door_swing')) {
      this.env.setDoorOpen(true);
    } else if (step.do === 'close_door' || step.do === 'lock_door') {
      this.env.setDoorOpen(false);
    }

    if (step.do === 'flip_sign_to_open') {
      this.env.setSignOpen(true);
    } else if (step.do === 'flip_sign_to_closed') {
      this.env.setSignOpen(false);
    }

    // 3. Đổi góc máy tương ứng
    if (step.do.includes('worry') || step.do.includes('angry') || step.do.includes('phone')) {
      this.cameraDirector.setPreset('CRISIS_DRAMA');
    } else if (step.do.includes('pour') || step.do.includes('coffee') || step.do.includes('wipe')) {
      this.cameraDirector.setPreset('BARISTA_ACTION');
    } else {
      this.cameraDirector.setPreset('FOLLOW_WALK');
    }

    // 4. Nếu bước này có đích đến (Target Node), tìm đường A* và đi tới đó
    if (step.target && WORLD_NODES[step.target]) {
      const targetPos = new THREE.Vector3(...WORLD_NODES[step.target].position);
      const startNode = this.pathfinding.findNearestNode(this.character.position);
      const path = this.pathfinding.findPath(startNode, step.target);
      path.push(targetPos);

      this.character.followPath(path, 2.8 * this.speedMultiplier, () => {
        // Đã đến nơi, phát action animation
        this.character.playAction(step.do);
      });
    } else {
      // Không cần di chuyển xa, phát action ngay tại chỗ
      this.character.playAction(step.do);
    }
  }

  public update(delta: number): void {
    if (!this.isRunning || !this.currentPlan) return;

    // Cập nhật đếm lùi thời gian của bước hiện tại
    this.stepTimer -= delta;
    if (this.stepTimer <= 0 && !this.character.isMoving) {
      this.currentStepIndex++;
      this.executeCurrentStep();
    }
  }
}
