import { prisma } from "@/lib/db/prisma";
import { GAME_RULE_KEYS, GAME_RULES_DEFAULTS } from "@/config/game-rules.default";
import type { LevelCurveParams } from "@/lib/game/level-curve";

const DEFAULTS = Object.fromEntries(GAME_RULES_DEFAULTS.map((rule) => [rule.key, rule.value]));

let cachedConfig: Record<string, unknown> | null = null;

async function loadConfig(): Promise<Record<string, unknown>> {
  if (cachedConfig) return cachedConfig;

  const entries = await prisma.configEntry.findMany();
  const parsed: Record<string, unknown> = {};
  for (const entry of entries) {
    try {
      parsed[entry.key] = JSON.parse(entry.value);
    } catch {
      // Valor malformado no banco — o chamador cai no fallback default.
    }
  }
  cachedConfig = parsed;
  return parsed;
}

export async function getConfigValue<T>(key: string, fallback: T): Promise<T> {
  const config = await loadConfig();
  return key in config ? (config[key] as T) : fallback;
}

export async function getLevelCurveParams(): Promise<LevelCurveParams> {
  const [base, exponent] = await Promise.all([
    getConfigValue<number>(GAME_RULE_KEYS.xpLevelCurveBase, DEFAULTS[GAME_RULE_KEYS.xpLevelCurveBase]),
    getConfigValue<number>(GAME_RULE_KEYS.xpLevelCurveExponent, DEFAULTS[GAME_RULE_KEYS.xpLevelCurveExponent]),
  ]);
  return { base, exponent };
}
