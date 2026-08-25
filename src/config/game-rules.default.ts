/**
 * Defaults das regras de jogo (XP, streak, energia/felicidade).
 * Fonte da verdade em runtime é a tabela ConfigEntry (ver ConfigService);
 * este arquivo só alimenta o seed inicial e serve de fallback tipado.
 * Nunca hardcode esses números em services/componentes — sempre via ConfigService.
 */

export const GAME_RULE_KEYS = {
  xpLevelCurveBase: "xp.levelCurve.base",
  xpLevelCurveExponent: "xp.levelCurve.exponent",
  streakWindowHours: "streak.windowHours",
  streakBonusXp: "streak.bonusXp",
  streakBonusThreshold: "streak.bonusThreshold",
  checkinGraceMinutesBefore: "checkin.graceMinutesBefore",
  checkinGraceMinutesAfter: "checkin.graceMinutesAfter",
  petEnergyPerCheckIn: "pet.energyPerCheckIn",
  petHappinessPerCheckIn: "pet.happinessPerCheckIn",
  petEnergyDecayPerDay: "pet.energyDecayPerDay",
  petHappinessDecayPerDay: "pet.happinessDecayPerDay",
  petMaxEnergy: "pet.maxEnergy",
  petMaxHappiness: "pet.maxHappiness",
} as const;

export type GameRuleKey = (typeof GAME_RULE_KEYS)[keyof typeof GAME_RULE_KEYS];

export interface GameRuleDefault {
  key: GameRuleKey;
  value: number;
  description: string;
}

/**
 * Curva de XP necessário por nível: xpRequiredForLevel(n) = base * n ^ exponent.
 * Com base=100, exponent=1.6: nível 2 ≈ 303 XP acumulado, nível 10 ≈ 3981 XP.
 */
export const GAME_RULES_DEFAULTS: GameRuleDefault[] = [
  {
    key: GAME_RULE_KEYS.xpLevelCurveBase,
    value: 100,
    description: "Multiplicador base da curva de XP por nível",
  },
  {
    key: GAME_RULE_KEYS.xpLevelCurveExponent,
    value: 1.6,
    description: "Expoente de crescimento da curva de XP por nível",
  },
  {
    key: GAME_RULE_KEYS.streakWindowHours,
    value: 24 * 10,
    description: "Janela (em horas) para um novo check-in ainda contar como continuidade de sequência",
  },
  {
    key: GAME_RULE_KEYS.streakBonusXp,
    value: 50,
    description: "XP bônus concedido ao atingir o limiar de sequência",
  },
  {
    key: GAME_RULE_KEYS.streakBonusThreshold,
    value: 3,
    description: "Quantidade de check-ins consecutivos dentro da janela para ganhar o bônus de sequência",
  },
  {
    key: GAME_RULE_KEYS.checkinGraceMinutesBefore,
    value: 30,
    description: "Minutos antes do startTime em que o check-in já é permitido",
  },
  {
    key: GAME_RULE_KEYS.checkinGraceMinutesAfter,
    value: 60,
    description: "Minutos após o endTime em que o check-in ainda é permitido",
  },
  {
    key: GAME_RULE_KEYS.petEnergyPerCheckIn,
    value: 20,
    description: "Energia ganha por check-in",
  },
  {
    key: GAME_RULE_KEYS.petHappinessPerCheckIn,
    value: 15,
    description: "Felicidade ganha por check-in",
  },
  {
    key: GAME_RULE_KEYS.petEnergyDecayPerDay,
    value: 5,
    description: "Decaimento diário de energia sem check-in",
  },
  {
    key: GAME_RULE_KEYS.petHappinessDecayPerDay,
    value: 5,
    description: "Decaimento diário de felicidade sem check-in",
  },
  {
    key: GAME_RULE_KEYS.petMaxEnergy,
    value: 100,
    description: "Energia máxima do pet",
  },
  {
    key: GAME_RULE_KEYS.petMaxHappiness,
    value: 100,
    description: "Felicidade máxima do pet",
  },
];
