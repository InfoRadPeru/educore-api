// Qué es: Re-exporta el decorador @Auth del módulo Auth para uso en Colegios.
// Por qué no duplicamos el guard: El guard vive en Auth y se exporta desde ahí.
// Cada módulo importa el decorador @Auth — no redefine la lógica.
// Principio SOLID: DRY + Single Responsibility.

export { Auth, JwtAuthGuard, PermisosGuard } from '@modules/auth/infrastructure/guards/auth.guard';