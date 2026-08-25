---
name: testing
description: Prioridades de teste do MoveGO — foco na camada de domínio (services), não em UI.
---

- Prioridade máxima de cobertura: `src/server/services/*`, por serem lógica pura/testável sem precisar de HTTP ou browser.
- `src/lib/game/level-curve.ts` (curva de XP) é função pura — cobrir com testes unitários simples de tabela de casos (nível baixo, nível alto, XP exato no limiar).
- `CheckInService.performCheckIn` é o teste de integração mais importante do produto. Cenários obrigatórios: evento inativo, fora da janela de horário, check-in duplicado (idempotência — não deve gerar XP duas vezes nem lançar erro para o usuário), concessão de item especial, desbloqueio de conquista, level up e evolução do pet no mesmo check-in.
- Testes de integração dos services rodam contra um banco Postgres real (o do Docker Compose local ou um banco de teste dedicado), nunca mockando o Prisma — a idempotência via constraint única (`P2002`) só é validada de verdade contra o banco.
- Não é necessário cobrir componentes de UI com testes automatizados no MVP — priorize teste manual mobile-first (ver skill `ui-ux-mobile`) e a suíte de services.
- Ao final de cada fase (conforme o plano de 8 fases), rodar `npm run build` e a suíte de testes de services antes de avançar para a próxima fase.
