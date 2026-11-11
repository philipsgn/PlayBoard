import type { Task, Customer } from './types.ts';

export class TaskQueue {
  private queue: Task[] = [];
  private maxQueueSize = 3;

  public getTasks(): readonly Task[] {
    return this.queue;
  }

  public enqueue(task: Task): boolean {
    if (this.queue.length >= this.maxQueueSize) {
      return false; // Hàng đợi tối đa 3 việc
    }
    this.queue.push(task);
    return true;
  }

  public dequeue(): Task | undefined {
    return this.queue.shift();
  }

  public peek(): Task | undefined {
    return this.queue[0];
  }

  public clear(): void {
    this.queue = [];
  }

  public isFull(): boolean {
    return this.queue.length >= this.maxQueueSize;
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Tự động đề xuất việc cần làm nhất dựa trên trạng thái khách hàng hiện tại
   */
  public static suggestNextTask(customers: Customer[]): Task | null {
    // 1. Khách cần thu tiền (đã nhận món)
    const payingCustomer = customers.find((c) => c.state === 'served');
    if (payingCustomer) {
      return {
        id: `pay_${payingCustomer.id}_${Date.now()}`,
        kind: 'pay',
        customerId: payingCustomer.id,
        durationSec: 1.2,
      };
    }

    // 2. Khách đang đợi món (ưu tiên người còn ít kiên nhẫn nhất)
    const waitingCustomers = customers
      .filter((c) => c.state === 'waiting' && c.order)
      .sort((a, b) => a.patience - b.patience);
    if (waitingCustomers.length > 0) {
      const target = waitingCustomers[0];
      return {
        id: `brew_${target.id}_${Date.now()}`,
        kind: 'brew',
        customerId: target.id,
        recipeId: target.order,
        durationSec: 2.5,
      };
    }

    // 3. Khách ở quầy cần ghi order
    const orderingCustomer = customers.find((c) => c.state === 'ordering');
    if (orderingCustomer) {
      return {
        id: `order_${orderingCustomer.id}_${Date.now()}`,
        kind: 'order',
        customerId: orderingCustomer.id,
        durationSec: 1.5,
      };
    }

    // 4. Khách vừa tới cần chào
    const arrivingCustomer = customers.find((c) => c.state === 'approach');
    if (arrivingCustomer) {
      return {
        id: `greet_${arrivingCustomer.id}_${Date.now()}`,
        kind: 'greet',
        customerId: arrivingCustomer.id,
        durationSec: 1.0,
      };
    }

    return null;
  }
}
