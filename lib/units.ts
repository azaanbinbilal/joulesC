export type WeightUnit = 'kg' | 'lb';
export type HeightUnit = 'cm' | 'ft_in';

export const LB_PER_KG = 2.2046226218;
export const CM_PER_IN = 2.54;
export const IN_PER_FT = 12;

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function inToCm(inches: number): number {
  return inches * CM_PER_IN;
}

export function cmToIn(cm: number): number {
  return cm / CM_PER_IN;
}

export function ftInToCm(ft: number, inches: number): number {
  return inToCm(ft * IN_PER_FT + inches);
}

export function cmToFtIn(cm: number): { ft: number; in: number } {
  const totalIn = cmToIn(cm);
  const ft = Math.floor(totalIn / IN_PER_FT);
  const inches = Math.round(totalIn - ft * IN_PER_FT);
  return { ft, in: inches };
}
