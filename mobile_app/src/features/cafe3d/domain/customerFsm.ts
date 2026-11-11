import type { Customer, CustomerArchetype, CustomerState } from './types.ts';

export const ARCHETYPE_CONFIG: Record<
  CustomerArchetype,
  { defaultPatience: number; preferredDrinks: string[]; tipChance: number; baseTip: number }
> = {
  student: {
    defaultPatience: 25,
    preferredDrinks: ['bac_xiu', 'tra_dao'],
    tipChance: 0.2,
    baseTip: 5_000,
  },
  office: {
    defaultPatience: 18,
    preferredDrinks: ['cafe_sua_da', 'cold_brew'],
    tipChance: 0.45,
    baseTip: 10_000,
  },
  elder: {
    defaultPatience: 30,
    preferredDrinks: ['cafe_sua_da'],
    tipChance: 0.3,
    baseTip: 8_000,
  },
  tourist: {
    defaultPatience: 22,
    preferredDrinks: ['cafe_muoi', 'bac_xiu'],
    tipChance: 0.6,
    baseTip: 15_000,
  },
  reviewer: {
    defaultPatience: 15,
    preferredDrinks: ['bac_xiu', 'cafe_muoi'],
    tipChance: 0.5,
    baseTip: 20_000,
  },
};

export function createCustomer(
  id: string,
  archetype: CustomerArchetype,
  rng: () => number
): Customer {
  const cfg = ARCHETYPE_CONFIG[archetype];
  const orderIndex = Math.floor(rng() * cfg.preferredDrinks.length);
  const drinkId = cfg.preferredDrinks[orderIndex];

  return {
    id,
    archetype,
    patience: cfg.defaultPatience,
    maxPatience: cfg.defaultPatience,
    order: drinkId,
    state: 'approach',
    waitTime: 0,
  };
}

export function updateCustomer(
  customer: Customer,
  dt: number
): { next: Customer; event?: 'walkout' | 'ready_to_leave' } {
  const next = { ...customer };

  // Khách đang xếp hàng hoặc chờ món thì mất dần kiên nhẫn
  if (next.state === 'queue' || next.state === 'waiting' || next.state === 'ordering') {
    next.patience -= dt;
    next.waitTime += dt;

    if (next.patience <= 0) {
      next.state = 'angryLeaving';
      return { next, event: 'walkout' };
    }
  } else if (next.state === 'seated') {
    // Khách uống nước tại bàn trong 12 giây rồi rời quán vui vẻ
    next.patience -= dt;
    if (next.patience <= 0) {
      next.state = 'leaving';
      return { next, event: 'ready_to_leave' };
    }
  }

  return { next };
}

export function transitionCustomerState(customer: Customer, nextState: CustomerState): Customer {
  return {
    ...customer,
    state: nextState,
    patience: nextState === 'seated' ? 12 : customer.patience,
  };
}
