---
name: pwa
description: Configuração PWA do MoveGO (Serwist), manifest e comportamento offline.
---

- Usar Serwist (`@serwist/next`), não `next-pwa` — suporte atual e ativo para App Router via `withSerwistInit` em `next.config.ts` + fonte do worker em `src/app/sw.ts`.
- `@serwist/next` usa um plugin webpack e **não suporta Turbopack** (padrão do Next.js 16). Por isso `dev`/`build` rodam com `--webpack` explícito no `package.json`. Não remova essa flag sem migrar para `@serwist/turbopack` (experimental) primeiro.
- `public/sw.js` é gerado no build (git-ignorado); nunca editar esse arquivo diretamente, editar `src/app/sw.ts`.
- Cache mínimo viável: shell da aplicação (assets estáticos, ícones, manifest) — nunca cachear respostas dinâmicas de check-in/XP/estado do pet, para não mostrar dado desatualizado ou permitir check-in "offline" inválido.
- `public/manifest.json` precisa de ícones maskable (Android) além dos normais, `display: "standalone"`, `name`/`short_name` = "MoveGO", cores de tema alinhadas à identidade visual pixel/8-bit.
- Testar o fluxo de instalação (Add to Home Screen) e o comportamento com a rede desligada mostrando ao menos uma tela de "sem conexão" amigável, nunca uma tela em branco.
- `NEXT_PUBLIC_APP_URL` é usado para montar os links absolutos de check-in nos QR Codes gerados — deve refletir a URL real de produção (Vercel) no deploy.
