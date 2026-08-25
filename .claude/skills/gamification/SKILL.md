---
name: gamification
description: Regras de balanceamento e evolução do MoveGO — XP, níveis, streak, evolução do pet, sempre data-driven.
---

- Todo número de balanceamento (XP por evento, decaimento de energia/felicidade, janela de streak, bônus) vem de `ConfigEntry` via `ConfigService` — nunca um número mágico dentro de um service ou componente. Ver `src/config/game-rules.default.ts` para as chaves existentes.
- A curva de XP por nível é uma função pura e testável em `src/lib/game/level-curve.ts` (`xpRequiredForLevel`, `calculateLevelForXp`), parametrizada por `base`/`exponent` vindos do config — não uma tabela fixa de thresholds por nível.
- Evolução do pet é 100% data-driven via `PetSpecies`/`PetEvolution` (nível mínimo → estágio). Nunca escreva `if (level === 5) return "Jovem"` em código — sempre consulte a tabela.
- Conquistas (`Achievement`) usam `criteriaType` (`CHECKIN_COUNT`/`STREAK`/`LEVEL`/`SPECIAL_EVENT`) + `criteriaValue` genérico — para adicionar uma conquista nova, normalmente basta uma linha no seed/admin, sem tocar em código do `AchievementService`.
- Streak (sequência) não deve assumir cadência fixa (ex.: "1x por semana") hardcoded na lógica — a janela de continuidade é `streak.windowHours` no config, ajustável sem deploy de código.
- Gamificação incentiva participação, mas não deve virar "competição espiritual": evite qualquer ranking público comparando usuários entre si no MVP (não faz parte do escopo — ver seção 24 do briefing original).
- Ao adicionar uma nova espécie de pet ou item, garanta que a lógica de resolução funcione para múltiplas espécies em paralelo — nunca assuma uma única `PetSpecies` fixa no código.
