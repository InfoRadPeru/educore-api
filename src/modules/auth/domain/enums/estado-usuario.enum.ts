// Qué es: Estado de la cuenta de usuario.
// Por qué enum aquí: No es un rol de negocio configurable. Es un estado del sistema
// con lógica interna (BLOQUEADO tiene reglas de tiempo). Vive en dominio.

export enum EstadoUsuario {
  ACTIVO    = 'ACTIVO',
  INACTIVO  = 'INACTIVO',
  BLOQUEADO = 'BLOQUEADO',
}