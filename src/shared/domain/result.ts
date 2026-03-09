// ARCHIVO 1 — src/shared/domain/result.ts
// Qué es: El corazón del manejo de errores. Implementa el patrón Result/Either.
// Patrón: Result Pattern (functional error handling).
// Por qué: En lugar de lanzar excepciones en los use cases, retornamos un Result<T, E>. Quien llama sabe explícitamente que puede fallar y debe manejar ambos casos. Elimina los try/catch ocultos.
// Principio SOLID: Open/Closed — nuevos errores se agregan sin modificar el Result.

export type Result<T, E extends AppError = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

export const fail = <E extends AppError>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

// ── Errores de dominio ──────────────────────────────────────────
// No conocen HTTP. No importan NestJS.
// El filtro global los convierte a respuestas HTTP.

export class AppError {
  constructor(
    public readonly code: string,
    public readonly message: string,
  ) {}
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super('NOT_FOUND', `${entity} con id '${id}' no encontrado`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Credenciales inválidas') {
    super('UNAUTHORIZED', message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No tienes permisos') {
    super('FORBIDDEN', message);
  }
}