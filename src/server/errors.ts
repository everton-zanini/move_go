/** Erros de domínio tipados — nunca `throw new Error(string)` solto nos services. */

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, "CONFLICT");
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

export class UnauthenticatedError extends DomainError {
  constructor(message = "Usuário não autenticado") {
    super(message, "UNAUTHENTICATED");
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Acesso não autorizado.") {
    super(message, "FORBIDDEN");
  }
}

export class EventNotFoundError extends NotFoundError {
  constructor() {
    super("Este QR Code não corresponde a nenhum evento.");
  }
}

export class EventInactiveError extends DomainError {
  constructor() {
    super("Este evento não está mais ativo.", "EVENT_INACTIVE");
  }
}

export class EventOutsideWindowError extends DomainError {
  constructor() {
    super("O check-in para este evento está fora do horário permitido.", "EVENT_OUTSIDE_WINDOW");
  }
}

export class InviteLinkNotFoundError extends NotFoundError {
  constructor() {
    super("Este link de cadastro não é válido.");
  }
}

export class InviteLinkExpiredError extends DomainError {
  constructor() {
    super("Este link de cadastro expirou. Peça um novo link ao administrador.", "INVITE_LINK_EXPIRED");
  }
}

export class InviteLinkInactiveError extends DomainError {
  constructor() {
    super("Este link de cadastro foi desativado.", "INVITE_LINK_INACTIVE");
  }
}
