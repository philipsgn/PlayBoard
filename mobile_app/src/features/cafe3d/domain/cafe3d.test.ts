import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createRNG } from './rng.ts';
import { PurePathfinding } from './pathfinding.ts';
import { createCustomer, updateCustomer, transitionCustomerState } from './customerFsm.ts';
import { TaskQueue } from './taskQueue.ts';
import { ShiftSim } from './shiftSim.ts';
import { ActionDirector } from './director.ts';
import type { WaypointGraph } from './types.ts';

describe('Cafe3D Solo Domain Tests', () => {
  test('RNG generates deterministic numbers with same seed', () => {
    const rng1 = createRNG('test_seed_123');
    const rng2 = createRNG('test_seed_123');

    for (let i = 0; i < 5; i++) {
      assert.equal(rng1(), rng2());
    }
  });

  test('PurePathfinding finds correct A* path between nodes', () => {
    const graph: WaypointGraph = {
      nodes: [
        { id: 'node_A', pos: [0, 0, 0] },
        { id: 'node_B', pos: [1, 0, 0] },
        { id: 'node_C', pos: [2, 0, 0] },
      ],
      edges: [
        ['node_A', 'node_B'],
        ['node_B', 'node_C'],
      ],
    };

    const pathfinder = new PurePathfinding(graph);
    const path = pathfinder.findPath('node_A', 'node_C');
    assert.equal(path.length, 3);
    assert.deepEqual(path[0], [0, 0, 0]);
    assert.deepEqual(path[2], [2, 0, 0]);
  });

  test('Customer FSM handles transitions and patience reduction', () => {
    const rng = createRNG('fsm_test');
    const customer = createCustomer('c1', 'office', rng);
    assert.equal(customer.state, 'approach');
    assert.equal(customer.patience, 18);

    const queued = transitionCustomerState(customer, 'queue');
    assert.equal(queued.state, 'queue');

    const { next } = updateCustomer(queued, 5);
    assert.equal(next.patience, 13);
  });

  test('TaskQueue respects max size and prioritizes tasks correctly', () => {
    const queue = new TaskQueue();
    assert.equal(queue.enqueue({ id: 't1', kind: 'greet', durationSec: 1 }), true);
    assert.equal(queue.enqueue({ id: 't2', kind: 'order', durationSec: 1 }), true);
    assert.equal(queue.enqueue({ id: 't3', kind: 'brew', durationSec: 1 }), true);
    // Vượt quá 3 việc
    assert.equal(queue.enqueue({ id: 't4', kind: 'pay', durationSec: 1 }), false);
    assert.equal(queue.isFull(), true);
  });

  test('ShiftSim runs deterministic simulation and produces valid ShiftResult', () => {
    const rng = createRNG('shift_sim_test');
    const sim = new ShiftSim(
      {
        cupsPerDay: 50,
        shiftSeconds: 10,
        shiftScale: 1.0,
        venue: 'main_street',
        seed: 'shift_sim_test',
      },
      rng
    );

    sim.autoMode = true;
    for (let i = 0; i < 20; i++) {
      sim.update(0.5);
    }

    const result = sim.getResult();
    assert.ok(result.served >= 0);
    assert.ok(typeof result.satisfactionDelta === 'number');
    assert.ok(typeof result.bonusTips === 'number');
  });

  test('ActionDirector maps Card 1, Card 2, Reviewer Crisis, Breakdown correctly', () => {
    const planCard1 = ActionDirector.mapEventToActionPlan('CH2_CARD_01', 'A');
    assert.ok(planCard1);
    assert.equal(planCard1?.id, 'plan_open_venue');

    const planReviewerA = ActionDirector.mapEventToActionPlan('CRISIS_TIKTOK_REVIEWER', 'A');
    assert.ok(planReviewerA);
    assert.equal(planReviewerA?.id, 'crisis_reviewer_option_a');

    const planBreakdown = ActionDirector.mapEventToActionPlan('BREAKDOWN', 'A');
    assert.ok(planBreakdown);
    assert.equal(planBreakdown?.id, 'breakdown_wrench_repair');
  });
});

