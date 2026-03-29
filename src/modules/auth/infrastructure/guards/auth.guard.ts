// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Guards de autenticación y autorización del sistema.
//
// CAMBIO vs versión anterior:
//   Se agrega el decorador @SoloPlatformAdmin().
//
// POR QUÉ @SoloPlatformAdmin() Y NO if (!esPlatformAdmin) EN EL CONTROLLER:
//   El controller tiene una sola responsabilidad: recibir el request,
//   llamar al use case, retornar la respuesta.
//   Decidir quién puede acceder a una ruta es responsabilidad del Guard.
//   Mezclar esa lógica en el controller viola SRP y ademas el throw
//   manual de un objeto literal no era reconocido por HttpExceptionFilter
//   — respondía HTTP 500 en lugar de 403.
//
// CÓMO FUNCIONA @SoloPlatformAdmin():
//   1. Marca la ruta con metadata SOLO_PLATFORM_ADMIN = true
//   2. PermisosGuard lee esa metadata
//   3. Si está marcada y el usuario no tiene esPlatformAdmin → ForbiddenException
//   4. ForbiddenException → HttpExceptionFilter → HTTP 403 correcto
//
// CÓMO USAR:
//   @SoloPlatformAdmin()   ← autorización declarativa, sin if en el controller
//   async listarColegios() { ... }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtPayload } from '../strategies/jwt.strategy';

// ── Metadata keys ────────────────────────────────────────────────────────────

export const PERMISOS_KEY         = 'permisos';
export const SOLO_PLATFORM_ADMIN  = 'soloPlatformAdmin';

// ── Decoradores simples ───────────────────────────────────────────────────────

export const RequierePermisos = (...permisos: string[]) =>
  SetMetadata(PERMISOS_KEY, permisos);

// Marca una ruta como exclusiva de PLATFORM_ADMIN.
// El PermisosGuard verifica esta metadata y lanza ForbiddenException si no aplica.
export const RequierePlatformAdmin = () =>
  SetMetadata(SOLO_PLATFORM_ADMIN, true);

// ── Guards ────────────────────────────────────────────────────────────────────

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();

    // ── Verificar si la ruta requiere PLATFORM_ADMIN ──────────────────────────
    const soloPlatformAdmin = this.reflector.getAllAndOverride<boolean>(
      SOLO_PLATFORM_ADMIN,
      [context.getHandler(), context.getClass()],
    );

    if (soloPlatformAdmin) {
      // ForbiddenException → HttpExceptionFilter → HTTP 403
      if (!user?.esPlatformAdmin) {
        throw new ForbiddenException('Esta operación requiere permisos de PLATFORM_ADMIN');
      }
      return true;
    }

    // ── Rutas de colegio: el token debe tener colegioId ──────────────────────
    if (!user?.esPlatformAdmin && !user?.colegioId) {
      throw new ForbiddenException('Token sin contexto de colegio. Selecciona un contexto primero.');
    }

    // ── Verificar permisos granulares ─────────────────────────────────────────
    const permisos = this.reflector.getAllAndOverride<string[]>(
      PERMISOS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Sin decorador @RequierePermisos → solo requiere estar autenticado
    if (!permisos?.length) return true;

    // PLATFORM_ADMIN: acceso total a todo
    if (user?.esPlatformAdmin) return true;

    // SUPER_ADMIN u otro rol de sistema: acceso total al colegio
    if (user?.esSistema) return true;

    // Verificación de permisos granulares
    const tienePermiso = permisos.every(p => user?.permisos?.includes(p));
    if (!tienePermiso) {
      throw new ForbiddenException('Sin permisos para esta acción');
    }
    return true;
  }
}

// ── Decoradores compuestos ────────────────────────────────────────────────────

// Uso normal: @Auth() o @Auth('ALUMNOS_VER', 'ALUMNOS_EDITAR')
export const Auth = (...permisos: string[]) =>
  applyDecorators(
    RequierePermisos(...permisos),
    UseGuards(JwtAuthGuard, PermisosGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token inválido o ausente' }),
    ApiForbiddenResponse({ description: 'Sin permisos para esta acción' }),
  );

// Uso exclusivo PLATFORM_ADMIN: @SoloPlatformAdmin()
// Equivale a @Auth() + verificación de esPlatformAdmin en el guard — sin ifs en el controller
export const SoloPlatformAdmin = () =>
  applyDecorators(
    RequierePlatformAdmin(),
    UseGuards(JwtAuthGuard, PermisosGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token inválido o ausente' }),
    ApiForbiddenResponse({ description: 'Requiere permisos de PLATFORM_ADMIN' }),
  );