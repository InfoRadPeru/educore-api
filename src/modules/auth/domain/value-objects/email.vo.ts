// Qué es: Value Object que encapsula la regla de qué es un email válido.
// Patrón: Value Object (DDD). Inmutable, sin identidad, se compara por valor.
// Principio SOLID: Single Responsibility — solo sabe validar emails.
// Por qué: En lugar de validar el email en 5 lugares distintos, la lógica vive en un solo lugar. Si la regla cambia, cambias un archivo.

import { Result, ok, fail, ValidationError } from "@shared/domain/result";

export class Email {
  private static readonly REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly _value: string) {}

  static create(raw: string): Result<Email, ValidationError> {
    const trimmed = raw?.trim().toLowerCase();

    if (!trimmed) {
      return fail(new ValidationError('El email no puede estar vacío'));
    }

    if (!Email.REGEX.test(trimmed)) {
      return fail(new ValidationError(`'${raw}' no es un email válido`));
    }

    return ok(new Email(trimmed));
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}