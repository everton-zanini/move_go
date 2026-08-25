---
name: database
description: Convenções de schema e migrations do MoveGO (Prisma + PostgreSQL).
---

- Toda mudança de schema passa por `npx prisma migrate dev --name <descrição>`. Nunca editar uma migration já aplicada — crie uma nova.
- Índices explícitos em toda foreign key usada em filtro/ordenação/list (ex.: `CheckIn.eventId`, `CheckIn.userId`, `Event.active+date`, `Pet.speciesId`). Prisma não cria isso automaticamente para relations 1:N.
- Constraints únicas compostas protegem regras de negócio no nível do banco, não só na aplicação: `CheckIn.@@unique([userId, eventId])`, `UserItem.@@unique([userId, itemId])`, `UserAchievement.@@unique([userId, achievementId])`, `PetEvolution.@@unique([speciesId, levelRequired])`.
- `ConfigEntry.value` é sempre uma string JSON válida (`JSON.stringify`); ao ler, sempre faça parse com fallback seguro para o default de `game-rules.default.ts` em vez de lançar erro se a chave não existir.
- IDs são `cuid()` em todos os models (não incrementais) — evita enumeração/adivinhação de recursos como eventos ou usuários.
- `prisma/seed.ts` deve ser idempotente (`upsert`, não `create` puro) para poder rodar mais de uma vez em dev sem duplicar dados.
- Ao adicionar um novo model, sempre revisar se ele precisa de `onDelete: Cascade` explícito nas relations (ex.: apagar um `User` deve limpar `Pet`, `CheckIn`, `UserItem`, `UserAchievement` associados).
- O datasource usa `url = env("DATABASE_URL")` (pooled) + `directUrl = env("DIRECT_URL")` (direta, usada pelo Prisma CLI em migrations/introspection). Isso é obrigatório com Prisma Postgres (Vercel), que só expõe a conexão de app via pooler. Localmente (Docker), `DIRECT_URL` pode ser igual a `DATABASE_URL` — sem pooler, não faz diferença.
