---
name: architecture
description: Regras de arquitetura do MoveGO — camadas, services, transações e organização de pastas do App Router.
---

- Nenhuma lógica de domínio em componentes React (Server ou Client). Componentes só orquestram UI; toda regra de negócio vive em `src/server/services/*`.
- Server Actions (`app/**/actions.ts`) e API Routes (`app/api/**/route.ts`) são a única porta de entrada para mutações — elas chamam services, nunca o Prisma client diretamente.
- Services usam `src/server/repositories/*` para acesso a dado. Repository é fino: encapsula queries reutilizadas/compostas. Um service pode chamar `prisma` diretamente só para um `findUnique` trivial e não reaproveitável — na dúvida, prefira o repository.
- Toda operação composta (que grava em mais de um model) roda dentro de `prisma.$transaction`. Ex.: `CheckInService.performCheckIn` cria `CheckIn`, atualiza `Pet`, pode criar `UserItem`/`UserAchievement` — tudo atômico.
- Erros de domínio são classes tipadas em `src/server/errors.ts` (`NotFoundError`, `ConflictError`, `ValidationError`, `EventInactiveError`, etc.), nunca `throw new Error(string)` solto. A camada de UI faz `instanceof` para decidir a mensagem exibida.
- Convenção de rotas do App Router: `(public)` = login/registro sem sessão; `(app)` = área do jovem autenticado (guarda de sessão no `layout.tsx`); `admin` = guarda de `role === "ADMIN"` no `layout.tsx` **e** de novo em cada server action (defesa em profundidade); `checkin/[token]` fora dos grupos anteriores por ser o alvo direto do QR Code impresso.
- Services expostos: `XPService`, `CheckInService`, `PetEvolutionService`, `AchievementService`, `InventoryService`, `EventService`, `ConfigService`. Cada um em seu próprio arquivo em `src/server/services/`; não crie um "God service".
