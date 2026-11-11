import type {
  ShiftConfig,
  ShiftResult,
  Customer,
  Task,
  CustomerArchetype,
} from './types.ts';
import { createCustomer, updateCustomer, transitionCustomerState } from './customerFsm.ts';
import { CAFE_RECIPES } from './recipes.ts';
import { TaskQueue } from './taskQueue.ts';

export type SimEvent =
  | { t: 'customerArrived'; id: string }
  | { t: 'orderTaken'; id: string; recipeId: string }
  | { t: 'drinkReady'; id: string; recipeId: string }
  | { t: 'served'; id: string }
  | { t: 'paid'; id: string; amount: number; tip: number }
  | { t: 'customerLeft'; id: string; angry: boolean }
  | { t: 'shiftEnded'; result: ShiftResult };

export class ShiftSim {
  private cfg: ShiftConfig;
  private rng: () => number;
  private timeRemaining: number;
  private customers: Customer[] = [];
  private taskQueue: TaskQueue = new TaskQueue();
  private currentTask: Task | null = null;
  private taskProgress = 0;

  // Thống kê kết quả
  private servedCount = 0;
  private walkedOutCount = 0;
  private totalWaitTime = 0;
  private totalTips = 0;
  private nextCustomerId = 1;
  private spawnTimer = 0;

  public autoMode = false;

  constructor(cfg: ShiftConfig, rng: () => number) {
    this.cfg = cfg;
    this.rng = rng;
    this.timeRemaining = cfg.shiftSeconds;
    this.spawnTimer = 1.0; // Khách đầu tiên tới sau 1s
  }

  public getCustomers(): readonly Customer[] {
    return this.customers;
  }

  public getCurrentTask(): Task | null {
    return this.currentTask;
  }

  public getTaskQueue(): readonly Task[] {
    return this.taskQueue.getTasks();
  }

  public getTimeRemaining(): number {
    return Math.max(0, this.timeRemaining);
  }

  public assignTask(task: Task): boolean {
    if (!this.currentTask) {
      this.currentTask = task;
      this.taskProgress = 0;
      return true;
    }
    return this.taskQueue.enqueue(task);
  }

  public update(dt: number): SimEvent[] {
    const events: SimEvent[] = [];
    if (this.timeRemaining <= 0) return events;

    this.timeRemaining -= dt;

    // 1. Sinh khách theo tỷ lệ
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.customers.length < 5) {
      const archetypes: CustomerArchetype[] = ['student', 'office', 'elder', 'tourist'];
      if (this.rng() < 0.15) archetypes.push('reviewer');
      const arch = archetypes[Math.floor(this.rng() * archetypes.length)];

      const customer = createCustomer(`c_${this.nextCustomerId++}`, arch, this.rng);
      this.customers.push(customer);
      events.push({ t: 'customerArrived', id: customer.id });

      // Khoảng cách spawn tiếp theo dựa trên cupsPerDay
      const interval = Math.max(4.0, 16.0 - (this.cfg.cupsPerDay / 10));
      this.spawnTimer = interval + (this.rng() * 4 - 2);
    }

    // 2. Chế độ Auto giao việc
    if (this.autoMode && !this.currentTask) {
      const autoTask = TaskQueue.suggestNextTask(this.customers);
      if (autoTask) {
        this.assignTask(autoTask);
      }
    }

    // 3. Tiến trình công việc của Minh
    if (this.currentTask) {
      this.taskProgress += dt;
      if (this.taskProgress >= this.currentTask.durationSec) {
        const finishedTask = this.currentTask;
        this.currentTask = this.taskQueue.dequeue() || null;
        this.taskProgress = 0;

        // Xử lý hệ quả của Task
        const targetCust = this.customers.find((c) => c.id === finishedTask.customerId);
        if (targetCust) {
          if (finishedTask.kind === 'greet') {
            const nextCust = transitionCustomerState(targetCust, 'ordering');
            this.replaceCustomer(nextCust);
          } else if (finishedTask.kind === 'order') {
            const nextCust = transitionCustomerState(targetCust, 'waiting');
            this.replaceCustomer(nextCust);
            events.push({ t: 'orderTaken', id: targetCust.id, recipeId: targetCust.order || 'cafe_sua_da' });
          } else if (finishedTask.kind === 'brew') {
            const nextCust = transitionCustomerState(targetCust, 'served');
            this.replaceCustomer(nextCust);
            events.push({ t: 'drinkReady', id: targetCust.id, recipeId: targetCust.order || 'cafe_sua_da' });
            events.push({ t: 'served', id: targetCust.id });
          } else if (finishedTask.kind === 'pay') {
            const recipe = CAFE_RECIPES.find((r) => r.id === targetCust.order) || CAFE_RECIPES[0];
            const tip = this.rng() < 0.5 ? Math.floor(recipe.price * 0.15) : 0;
            this.totalTips += tip;
            this.servedCount++;
            this.totalWaitTime += targetCust.waitTime;

            events.push({
              t: 'paid',
              id: targetCust.id,
              amount: recipe.price,
              tip,
            });

            // Chuyển sang ngồi uống hoặc rời quán
            const nextCust = transitionCustomerState(targetCust, 'seated');
            this.replaceCustomer(nextCust);
          }
        }
      }
    }

    // 4. Cập nhật FSM của từng khách
    for (let i = this.customers.length - 1; i >= 0; i--) {
      const cust = this.customers[i];
      const { next, event } = updateCustomer(cust, dt);
      this.customers[i] = next;

      if (event === 'walkout') {
        this.walkedOutCount++;
        events.push({ t: 'customerLeft', id: next.id, angry: true });
        this.customers.splice(i, 1);
      } else if (event === 'ready_to_leave') {
        events.push({ t: 'customerLeft', id: next.id, angry: false });
        this.customers.splice(i, 1);
      }
    }

    // 5. Kết thúc ca
    if (this.timeRemaining <= 0) {
      events.push({ t: 'shiftEnded', result: this.getResult() });
    }

    return events;
  }

  private replaceCustomer(cust: Customer): void {
    const idx = this.customers.findIndex((c) => c.id === cust.id);
    if (idx !== -1) {
      this.customers[idx] = cust;
    }
  }

  public getResult(): ShiftResult {
    const avgWait = this.servedCount > 0 ? this.totalWaitTime / this.servedCount : 0;
    // Tính toán độ hài lòng: phục vụ nhiều tăng +%, bị bỏ về giảm -%
    const satisfactionDelta = Math.min(10, Math.max(-15, this.servedCount * 2 - this.walkedOutCount * 4));

    return {
      served: this.servedCount,
      walkedOut: this.walkedOutCount,
      avgWaitSec: Math.round(avgWait * 10) / 10,
      mistakes: 0,
      satisfactionDelta,
      bonusTips: this.totalTips,
    };
  }
}
