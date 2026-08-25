---
name: qr-checkin
description: Regras de segurança e idempotência do fluxo de check-in por QR Code.
---

- O token do QR (`Event.qrCodeToken`) é opaco (`nanoid`), nunca o ID sequencial/incremental do evento — não deve ser adivinhável.
- Nunca confie em nada vindo do client sobre o estado do check-in (ex.: "já fiz check-in", "evento está ativo"). Toda validação é revalidada no servidor no momento da chamada: evento existe, `active === true`, dentro da janela `[startTime - graceBefore, endTime + graceAfter]`, usuário autenticado.
- Idempotência é garantida pela constraint única `@@unique([userId, eventId])` em `CheckIn`, não por uma checagem prévia isolada (`findFirst` seguido de `create`) — isso tem race condition sob dois taps rápidos ou requests concorrentes. O fluxo correto é: tentar `create`, capturar o erro Prisma `P2002` e tratar como "já fez check-in" (idempotente, sem erro para o usuário, sem XP duplicado).
- `/checkin/[token]` deve funcionar como deep link direto do QR impresso: se o usuário não está autenticado, redirecionar para login preservando `callbackUrl=/checkin/[token]` para retomar o fluxo após o login.
- Toda a lógica de validação/orquestração do check-in vive em `CheckInService.performCheckIn`, dentro de uma única `prisma.$transaction` — a rota/página só chama o service e renderiza o resultado.
- Erros de domínio específicos (`EventNotFoundError`, `EventInactiveError`, `EventOutsideWindowError`) devem virar mensagens amigáveis na tela (ex.: "Este QR Code não é mais válido"), nunca um erro genérico de servidor.
