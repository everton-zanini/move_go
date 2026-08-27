---
name: pixel-art-game-ui
description: Approach visual do pet (arte real por estágio) e da UI pixel/8-bit do MoveGO.
---

- O pet tem arte própria por estágio de evolução: `public/pet/<chave>.png` (chaves: `egg`,
  `hatchling`, `young`, `adult`, `special`), estilo chibi (cabeça grande, olhos grandes com
  delineado, bico destacado, crista tipo chama, remendo de peito com raio). Origem: referência
  visual fornecida pelo usuário, com fundo removido (checkerboard -> alpha real) e recortada por
  estágio — ver histórico de conversa/commit para o processo caso precise regerar.
- `src/components/pet/PetSprite.tsx` resolve `PetEvolution.sprite` (a **chave** no banco) para o
  arquivo de imagem via `next/image`, dentro da `pixel-frame` com as classes `pet-idle`/`pet-blink`
  (CSS em `globals.css`) para dar movimento. Adicionar uma espécie/estágio novo = adicionar o PNG
  em `public/pet/` + uma entrada no mapa `SPRITE_IMAGES`, sem migration.
- A UI ao redor (moldura, HUD, números) continua na estética pixelada/8-bit: `pixel-frame` com
  bordas em degraus via `box-shadow`, paleta saturada mas limitada, fonte pixelada ("Press Start
  2P") só em títulos/números de destaque (nível, XP, nome do app) — nunca em corpo de
  texto/parágrafos, pixel font em texto longo é ilegível em telas pequenas.
- Progressão de cor por estágio (referência atual): turquesa (egg) -> verde (hatchling) -> amarelo
  (young) -> roxo (adult) -> holográfico com auréola (special).
- Itens equipáveis (HAT/ACCESSORY/FRAME, `src/server/repositories/item.repository.ts`) ainda
  precisam de posicionamento próprio em cima dessas imagens (coordenadas por estágio, já que cada
  PNG tem proporção/enquadramento levemente diferente) — não há mais um "rig" de grid
  compartilhado como na versão SVG anterior.
- Animação idle do pet é propositalmente simples: pequeno movimento vertical (bounce) + piscar
  periódico via CSS. Sem física complexa, sem spritesheet frame-a-frame.
