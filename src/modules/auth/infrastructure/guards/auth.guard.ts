// Qué es: Guards de autenticación y autorización por permisos.
// Cambio vs versión anterior: RolesGuard → PermisosGuard.
// Los roles son strings en BD. El guard verifica permisos específicos,
// no el nombre del rol. Así un ADMIN y un COORDINADOR pueden tener
// el mismo permiso 'ALUMNOS_VER' sin tocar el guard.
// esPlatformAdmin y esSistema son bypass de autorización.

import { applyDecorators, CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UseGuards } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { JwtPayload } from "../strategies/jwt.strategy";
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";

export const PERMISOS_KEY = 'permisos';

export const RequierePermisos = (...permisos: string[]) =>
  SetMetadata(PERMISOS_KEY, permisos);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permisos = this.reflector.getAllAndOverride<string[]>(PERMISOS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sin decorador @RequierePermisos → solo requiere estar autenticado
    if (!permisos?.length) return true;

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();

    // PLATFORM_ADMIN: acceso total a todo
    if (user?.esPlatformAdmin) return true;

    // SUPER_ADMIN u otro rol de sistema: acceso total al colegio
    if (user?.esSistema) return true;

    // Verificación de permisos granulares
    const tienePermiso = permisos.every(p => user?.permisos?.includes(p));
    if (!tienePermiso) throw new ForbiddenException('Sin permisos para esta acción');
    return true;
  }
}

// Decorador compuesto — uso: @Auth('ALUMNOS_VER', 'ALUMNOS_EDITAR')
export const Auth = (...permisos: string[]) =>
  applyDecorators(
    RequierePermisos(...permisos),
    UseGuards(JwtAuthGuard, PermisosGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token inválido o ausente' }),
    ApiForbiddenResponse({ description: 'Sin permisos para esta acción' }),
  );