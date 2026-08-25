---
name: ui-ux-mobile
description: Padrões de UX mobile-first do MoveGO — o jovem usa o app no celular, geralmente durante ou logo após o culto.
---

- Mobile-first sempre: desenhe primeiro para uma tela de ~375px de largura, depois adapte para tablet/desktop. Nunca o inverso.
- A home é essencialmente PET + STATUS + AÇÕES — resista à tentação de adicionar mais blocos de informação nela.
- Área de toque mínima de 44x44px em qualquer elemento interativo (botões da bottom nav, botão de check-in, itens do inventário).
- Bottom navigation fixa com 4 itens (🏠 Pet, 🎒 Itens, 🏆 Conquistas, 👤 Perfil) — não adicione um 5º item sem remover outro.
- Dark-mode-first: o público acessa isso com pouca luz (durante o culto/evento). Contraste alto, sem fundos claros ofuscantes.
- Fluxo de check-in é o caminho mais crítico do produto: sem modais bloqueantes, sem passos extras. Estado de loading otimista (feedback visual imediato de "processando") antes da confirmação do servidor.
- Evite telas cheias de texto/informação. Prefira cards grandes, ícones e números grandes a parágrafos.
- Todo texto em português (PT-BR), tom direto e jovem, nunca infantilizado (público de 12 a 29 anos).
