# MoveGO

**Faça check-in. Ganhe XP. Evolua. 🚀**

PWA de gamificação para ministérios de jovens — nasceu no **Move Santana** (Igreja Verbo da Vida Santana) e hoje atende **várias igrejas isoladas** na mesma instalação. O jovem tem um pet virtual estilo Tamagotchi/pixel art que cresce por XP, ganho fazendo check-in via QR Code em cultos e eventos.

> Status: **MVP completo (Fase 8/8)** — projeto, arquitetura, banco de dados, autenticação, pet/XP/evolução, check-in por QR Code, painel administrativo, inventário/conquistas, compartilhamento e PWA (ícones, offline, telas de erro estilizadas) já funcionando de ponta a ponta. Ver `.claude/plans` e seção "Roadmap" abaixo para o histórico de fases.

## Stack

- Next.js (App Router) + TypeScript + React
- Tailwind CSS
- Prisma ORM + PostgreSQL
- Auth.js (NextAuth v5) — Credentials (email + senha), sessão JWT
- QR Code: geração (`qrcode`) e leitura (`qr-scanner`)
- PWA via Serwist
- Deploy alvo: Vercel

## Pré-requisitos

- Node.js 20+
- Docker (para o Postgres local) — ou uma connection string de um Postgres já existente

## Instalação

```bash
npm install
cp .env.example .env
```

Edite `.env` se necessário (veja "Variáveis de ambiente" abaixo). Um `AUTH_SECRET` aleatório já é sugerido no `.env` gerado localmente — gere o seu com:

```bash
npx auth secret
# ou
openssl rand -base64 32
```

## Banco de dados

Suba o Postgres local via Docker Compose:

```bash
npm run db:up      # docker compose up -d db
```

Rode as migrations e o seed inicial:

```bash
npx prisma migrate dev
npx prisma db seed
```

Para inspecionar o banco visualmente:

```bash
npm run prisma:studio
```

Para derrubar o banco local:

```bash
npm run db:down
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string pooled do Postgres (Docker local por padrão; na Vercel com Prisma Postgres é injetada automaticamente pela integração) |
| `DIRECT_URL` | Connection string direta, usada pelo Prisma CLI para migrations/introspection (localmente pode ser igual a `DATABASE_URL`; na Vercel com Prisma Postgres também é injetada automaticamente) |
| `AUTH_SECRET` | Segredo usado pelo Auth.js para assinar sessões/JWT |
| `NEXTAUTH_URL` | URL base da aplicação (usada pelo Auth.js) |
| `NEXT_PUBLIC_APP_URL` | URL pública usada para montar os links de check-in dos QR Codes (`/checkin/[token]`) |
| `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` | Opcionais. Usadas só pelo seed e pelo `prisma/create-super-admin.ts` para criar o super-admin — **não precisam estar na Vercel** (o deploy não roda o seed) |

## Rodando localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Verifique a conexão com o banco em [http://localhost:3000/api/health](http://localhost:3000/api/health) — deve retornar `{"status":"ok","db":true}`.

## Build

```bash
npm run build
npm run start
```

## Seed — dados de exemplo

O `prisma/seed.ts` cria:

- a igreja padrão **Move Santana** (`id: church-move-santana`, slug `move-santana`)
- 1 usuário admin da Move Santana (`admin@movesantana.com` / `movepet123` — **troque em produção**)
- 1 super-admin, apenas se `SUPER_ADMIN_EMAIL` e `SUPER_ADMIN_PASSWORD` estiverem definidos
- 1 linhas de pet ("Gust", "Roam", "Tide" e "Ígneo"; ovo compartilhado) com 5 estágios de evolução (Spark → Rise → Surge → Ascend → Apex)
- 4 itens de inventário (incluindo o item especial "Fone Adora")
- 6 conquistas
- 3 eventos de exemplo, cada um com um QR Code de teste (`/checkin/<token>`) — os tokens são impressos no console ao rodar `npx prisma db seed`

## Multi-igreja (tenants)

Cada igreja é um tenant isolado (model `Church`): **usuários, eventos, convites e check-ins pertencem a uma igreja**, e o admin de uma igreja não enxerga nada das outras. Espécies de pet, itens, conquistas e regras do jogo (`ConfigEntry`) são **globais**, compartilhados por todas.

- **Papéis** (`Role`): `USER` (jogador), `ADMIN` (admin da sua igreja, inclusive com o painel de debug na home) e `SUPER_ADMIN` (administra a plataforma; não pertence a nenhuma igreja e não tem pet).
- **Cadastro de jogador**: pelo link de convite (`/invite/[token]`) — o usuário entra na igreja dona do convite. O e-mail é único global: uma conta pertence a uma igreja só.
- **Isolamento**: todo repository/service recebe `churchId`; buscas por id em fluxos de admin usam `{ id, churchId }`. QR Code ou código curto de outra igreja responde como "evento não encontrado".
- **Promoção de admin**: em `/admin/users` o admin da igreja promove/rebaixa usuários da própria igreja. Ninguém altera o próprio papel e a igreja nunca fica sem pelo menos um admin ativo.
- **Autorização lida do banco**: `src/server/auth/context.ts` (`getCurrentUser`, `requireMember`, `requireChurchAdmin`, `requireSuperAdmin`) — papel, igreja e status ativo podem mudar depois do login e valem na hora, sem relogar. O `src/proxy.ts` só verifica se há sessão; **nunca redirecione por role no proxy** (o role do JWT pode estar desatualizado e gerar loop de redirect com os layouts).

### Painel da plataforma (`/platform`)

Acesso separado, com login próprio em `/platform/login`, restrito a `SUPER_ADMIN`:

- listar igrejas (usuários, eventos, status);
- criar igreja já com o primeiro admin (nome, e-mail, senha inicial);
- editar nome/identificador e ativar/desativar a igreja — **desativar** bloqueia login, derruba sessões abertas e invalida os convites dela;
- ver os usuários de cada igreja, ativar/desativar, promover/rebaixar e adicionar novos admins.

### Criando o super-admin

Sem rodar o seed completo (útil em produção, onde o seed criaria eventos de exemplo):

```bash
SUPER_ADMIN_EMAIL="voce@dominio.com" SUPER_ADMIN_PASSWORD="senha-forte" npx tsx prisma/create-super-admin.ts
```

Para produção, carregue antes as variáveis de `DATABASE_URL`/`DIRECT_URL` de produção no shell (ex.: `set -a && . ./.env.production.local && set +a`). Rodar de novo com o mesmo e-mail só troca a senha. O script **recusa converter uma conta de jogador/admin já existente** — use um e-mail que ainda não tenha conta.

## Criando um novo evento e gerando seu QR Code

No painel `/admin` (login com um admin da igreja, ex. `admin@movesantana.com`; o evento é criado na igreja dele): `/admin/events/new` → preencher nome, descrição, data, horário de início/término e XP → salvar → você é redirecionado direto para `/admin/events/[id]/qrcode`, com o QR Code pronto para imprimir ou baixar (PNG), apontando para `NEXT_PUBLIC_APP_URL/checkin/<qrCodeToken>`.

Em `/admin/events` também dá pra editar, ativar/desativar (recomendado ao encerrar um evento) e excluir — exclusão é bloqueada se o evento já tiver check-ins registrados (desative-o nesse caso).

> **Fuso horário**: data/horário do evento são interpretados no fuso horário do servidor (sem offset explícito). Em produção na Vercel (padrão UTC), configure a variável de ambiente `TZ=America/Sao_Paulo` para os horários digitados no admin corresponderem ao horário de Brasília na validação do check-in.

## Arquitetura

Ver `.claude/skills/architecture/SKILL.md` para as convenções de camadas (UI → server actions → services → repositories → Prisma) e os demais skills em `.claude/skills/` para UI/UX mobile, pixel art, gamificação, QR/check-in, banco de dados, PWA e testes.

## Roadmap (fases)

1. ✅ Projeto + arquitetura + banco
2. ✅ Autenticação (`/login`, `/register`, sessão JWT, proteção de rotas via `src/proxy.ts`, gate de `role` para `/admin`)
3. ✅ Pet + evolução + XP (tela principal com pet, barra de XP, energia/felicidade/sequência; `XPService`, `PetEvolutionService`, `ConfigService`; pet criado automaticamente no cadastro)
4. ✅ Check-in por QR Code (`/checkin/[token]`, `CheckInService.performCheckIn` transacional — valida evento ativo/janela de horário, idempotência via constraint única, aplica XP/streak/energia/felicidade e recalcula evolução)
5. ✅ Eventos/admin (`/admin` — dashboard com métricas, CRUD de eventos com geração de QR Code/impressão/download, ativar/desativar, exclusão protegida contra eventos com check-ins, listagem de usuários com nível/XP/check-ins)
6. ✅ Inventário/conquistas (`InventoryService`, `AchievementService` — item especial do evento, desbloqueio automático por nível/quantidade de check-ins, avaliação de conquistas, tudo disparado dentro da mesma transação do check-in; `/inventory` e `/achievements` com dados reais, equipar/desequipar itens por slot)
7. ✅ Compartilhamento (card visual gerado client-side com `html-to-image`, na tela de resultado do check-in — evolução/conquista/item têm prioridade sobre o check-in simples; usa a Web Share API nativa quando disponível — ótimo pra Instagram/WhatsApp — com fallback de download da imagem)
8. ✅ PWA + refinamento visual (ícones reais 192/512 + maskable, fallback offline em `/~offline`, páginas 404/erro estilizadas, `trustHost` corrigido para funcionar em produção fora da Vercel, `robots.txt` bloqueando indexação — app privado — e ajustes de contraste; auditado com Lighthouse: Accessibility 100, Best Practices 100)
9. ✅ Multi-igreja (tenants isolados por `churchId`, migration `add_churches` movendo os dados existentes para a Move Santana, promoção de admins por igreja e painel de super-admin em `/platform`)

## Ideias futuras (backlog)

- **Troca de experiências entre jovens em eventos especiais** (inspirado na troca de Pokémon via cabo link do Game Boy): permitir que dois usuários "troquem" algo (item, XP bônus, conquista especial de evento) entre si durante um evento. Bluetooth/Web Bluetooth foi descartado — Safari/iOS não implementa a API. Abordagem recomendada: **mediada pelo servidor**, reaproveitando o mesmo padrão de QR Code/código curto já usado no check-in (`shortCode` em `Event`, `CheckInModal`) — um usuário gera um código de troca temporário, o outro escaneia ou digita, e o servidor casa os dois e executa a troca dentro de uma transação (`prisma.$transaction`), igual ao `CheckInService.performCheckIn`. Não requer WebRTC/P2P nem API nativa nenhuma, funciona igual em iPhone e Android dentro do PWA.

## Deploy na Vercel

1. Na aba **Storage** do projeto na Vercel, crie um banco **Prisma Postgres** (ou outro Postgres gerenciado — Neon, Supabase). A integração da Vercel injeta `DATABASE_URL` (pooled) e `DIRECT_URL` (direta) automaticamente nas env vars do projeto — não precisa configurar essas duas manualmente.
2. Configure as demais variáveis de ambiente do projeto na Vercel: `AUTH_SECRET` (gere um novo, não reuse o do `.env` local), `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` (a URL final do deploy) e `TZ=America/Sao_Paulo` (ver nota sobre fuso horário acima).
3. Deploy normal via `vercel` CLI ou integração com o repositório Git — o script `vercel-build` do `package.json` já roda `prisma migrate deploy` automaticamente antes do build, então a Vercel detecta e usa esse script sozinha (convenção própria dela, não precisa configurar nada no painel). Novas migrations criadas depois são aplicadas automaticamente a cada deploy.
4. No primeiro deploy, rode o seed uma vez contra produção: `DATABASE_URL=... DIRECT_URL=... npx prisma db seed` (localmente, apontando pras env vars de produção) — troque a senha do admin padrão (`admin@movesantana.com` / `movepet123`) logo em seguida, direto no banco.
5. Crie o super-admin com `prisma/create-super-admin.ts` (ver "Criando o super-admin") e cadastre as demais igrejas pelo painel `/platform`.
