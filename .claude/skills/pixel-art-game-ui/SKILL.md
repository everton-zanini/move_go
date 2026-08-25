---
name: pixel-art-game-ui
description: Approach visual pixel art/8-bit do pet e da UI do MoveGO no MVP, sem assets de arte prontos.
---

- MVP não tem spritesheets desenhados. O pet é renderizado como emoji/glyph grande dentro de uma "moldura pixelada" CSS: `image-rendering: pixelated`, bordas em degraus via `box-shadow`/`clip-path`, paleta limitada (estilo Game Boy/8-bit).
- `PetEvolution.sprite` no banco guarda uma **chave** (ex.: `"egg"`, `"hatchling"`), nunca a imagem em si. Isso permite trocar o emoji por um spritesheet real depois sem migration — só troca o componente `PetSprite` que resolve a chave.
- Tipografia: use uma fonte pixelada (ex. "Press Start 2P") só em títulos/números de destaque (nível, XP, nome do app). Nunca em corpo de texto/parágrafos — pixel font em texto longo é ilegível em telas pequenas.
- Paleta: saturada mas limitada (poucas cores por elemento), evitando gradientes suaves típicos de UI "flat moderna" — isso quebra a estética 8-bit.
- Evite qualquer referência visual direta a Pokémon/Tamagotchi (paletas, silhuetas, UI chrome). O objetivo é "inspirado em", não "clone de".
- Público de 12-29 anos: evite traços fofos/arredondados demais, cores pastel, ou qualquer elemento que leia como "app infantil". Prefira contraste alto e composição mais "arcade retrô".
- Animação idle do pet é propositalmente simples: pequeno movimento vertical (bounce), piscar periódico, ocasional troca de expressão. Sem física complexa, sem sprite animation frame-a-frame no MVP.
