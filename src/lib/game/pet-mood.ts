export type PetMood = "happy" | "neutral" | "sad";

const HAPPY_THRESHOLD = 70;
const SAD_THRESHOLD = 40;

/** O humor segue a média de energia e felicidade (ambas 0–100 por padrão). */
export function getPetMood(energy: number, happiness: number): PetMood {
  const score = (energy + happiness) / 2;
  if (score >= HAPPY_THRESHOLD) return "happy";
  if (score < SAD_THRESHOLD) return "sad";
  return "neutral";
}

export const PET_MOOD_MESSAGES: Record<PetMood, string> = {
  happy: "Tô com energia total! Bora pro próximo culto?",
  neutral: "Tô bem, mas sinto saudade dos encontros.",
  sad: "Faz tempo que a gente não se vê... volta pra mim?",
};
