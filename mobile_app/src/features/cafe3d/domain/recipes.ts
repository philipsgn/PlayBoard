import type { Recipe } from './types.ts';

export const CAFE_RECIPES: Recipe[] = [
  {
    id: 'bac_xiu',
    name: 'Bạc Xỉu Đá Sài Gòn',
    price: 32_000,
    steps: [
      { kind: 'steam', sec: 1.0 },
      { kind: 'grind', sec: 1.0 },
      { kind: 'brew', sec: 1.5 },
      { kind: 'ice', sec: 0.5 },
      { kind: 'pour', sec: 1.0 },
    ],
  },
  {
    id: 'cafe_sua_da',
    name: 'Cà Phê Sữa Đá Truyền Thống',
    price: 28_000,
    steps: [
      { kind: 'grind', sec: 1.0 },
      { kind: 'brew', sec: 1.5 },
      { kind: 'pour', sec: 0.8 },
      { kind: 'ice', sec: 0.5 },
      { kind: 'mix', sec: 0.8 },
    ],
  },
  {
    id: 'cafe_muoi',
    name: 'Cà Phê Muối Kem Béo',
    price: 35_000,
    steps: [
      { kind: 'grind', sec: 1.0 },
      { kind: 'brew', sec: 1.5 },
      { kind: 'ice', sec: 0.5 },
      { kind: 'pour', sec: 0.8 },
      { kind: 'garnish', sec: 1.2 },
    ],
  },
  {
    id: 'cold_brew',
    name: 'Cold Brew Cam Sả',
    price: 38_000,
    steps: [
      { kind: 'pour', sec: 1.0 },
      { kind: 'ice', sec: 0.5 },
      { kind: 'mix', sec: 0.8 },
      { kind: 'garnish', sec: 0.8 },
    ],
  },
  {
    id: 'tra_dao',
    name: 'Trà Đào Cam Sả Tươi',
    price: 32_000,
    steps: [
      { kind: 'mix', sec: 1.0 },
      { kind: 'ice', sec: 0.5 },
      { kind: 'pour', sec: 0.8 },
      { kind: 'garnish', sec: 1.0 },
    ],
  },
];

export function getRecipe(id: string): Recipe | undefined {
  return CAFE_RECIPES.find((r) => r.id === id);
}
