/**
 * Curva de XP pura — sem I/O, testável isoladamente.
 * xpRequiredForLevel(n) = base * n ^ exponent (XP acumulado total para alcançar o nível n).
 */

export interface LevelCurveParams {
  base: number;
  exponent: number;
}

export function xpRequiredForLevel(level: number, params: LevelCurveParams): number {
  if (level <= 1) return 0;
  return Math.round(params.base * Math.pow(level, params.exponent));
}

export function calculateLevelForXp(totalXp: number, params: LevelCurveParams, maxLevel = 100): number {
  let level = 1;
  while (level < maxLevel && totalXp >= xpRequiredForLevel(level + 1, params)) {
    level += 1;
  }
  return level;
}

export function xpProgressForLevel(
  totalXp: number,
  level: number,
  params: LevelCurveParams
): { current: number; required: number } {
  const currentLevelXp = xpRequiredForLevel(level, params);
  const nextLevelXp = xpRequiredForLevel(level + 1, params);
  return {
    current: totalXp - currentLevelXp,
    required: nextLevelXp - currentLevelXp,
  };
}
