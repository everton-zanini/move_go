export interface PetTheme {
  element: string;
  accent: string;
  description: string;
}

const DEFAULT_THEME: PetTheme = {
  element: "Ovo",
  accent: "#39ff88",
  description: "Um ovo cheio de energia, prestes a chocar.",
};

// A cor e o elemento seguem a linha evolutiva (identificada pelo prefixo da chave do sprite).
const THEMES_BY_LINE: Record<string, PetTheme> = {
  gust: { element: "Ar", accent: "#facc15", description: "Ave ágil e leve, sempre pronta pra voar mais alto." },
  roam: { element: "Terra", accent: "#4ade80", description: "Lobo leal que anda com você em qualquer caminho." },
  tide: { element: "Água", accent: "#38bdf8", description: "Tartaruga calma e resistente, avança sem pressa." },
  igneo: { element: "Fogo", accent: "#fb923c", description: "Salamandra intensa, que brilha mais a cada passo." },
};

const GUST_SPRITE_KEYS = new Set(["hatchling", "young", "adult", "special"]);

export function getLineKey(spriteKey: string): string | null {
  if (GUST_SPRITE_KEYS.has(spriteKey)) return "gust";
  const prefix = spriteKey.split("_")[0];
  return prefix in THEMES_BY_LINE ? prefix : null;
}

export function getPetTheme(spriteKey: string): PetTheme {
  const line = getLineKey(spriteKey);
  return line ? THEMES_BY_LINE[line] : DEFAULT_THEME;
}
