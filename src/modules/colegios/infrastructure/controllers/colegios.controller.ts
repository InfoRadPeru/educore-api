// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Controller de SUPER_ADMIN — gestión del propio colegio.
//
// CAMBIO vs versión anterior:
//   Las rutas de PLATFORM_ADMIN (GET /, PATCH /:id/plan, PATCH /:id/estado)
//   se movieron a AdminColegiosController.
//   Este controller ya solo conoce un actor: SUPER_ADMIN.
//   El colegioId siempre viene del JWT — nunca del path.
//
// PRINCIPIO SOLID: Single Responsibility.
//   Un controller, un actor, una fuente de identidad (el JWT).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';

import { ObtenerMiColegioUseCase }        from '../../application/use-cases/obtener-mi-colegio.use-case';
import { ActualizarMiColegioUseCase }     from '../../application/use-cases/actualizar-mi-colegio.use-case';
import { ObtenerConfiguracionUseCase }    from '../../application/use-cases/obtener-configuracion.use-case';
import { ActualizarConfiguracionUseCase } from '../../application/use-cases/actualizar-configuracion.use-case';
import { ObtenerPlanUseCase }             from '../../application/use-cases/obtener-plan.use-case';
import { ListarSedesUseCase }             from '../../application/use-cases/listar-sedes.use-case';
import { CrearSedeUseCase }               from '../../application/use-cases/crear-sede.use-case';
import { ActualizarSedeUseCase }          from '../../application/use-cases/actualizar-sede.use-case';
import { CambiarEstadoSedeUseCase }       from '../../application/use-cases/cambiar-estado-sede.use-case';
import { ListarNivelesUseCase }           from '../../application/use-cases/listar-niveles.use-case';
import { CambiarEstadoNivelUseCase }      from '../../application/use-cases/cambiar-estado-nivel.use-case';
import { ListarRolesUseCase }            from '../../application/use-cases/listar-roles.use-case';
import { CrearRolUseCase }               from '../../application/use-cases/crear-rol.use-case';
import { ActualizarRolUseCase }          from '../../application/use-cases/actualizar-rol.use-case';
import { EliminarRolUseCase }            from '../../application/use-cases/eliminar-rol.use-case';
import { ListarPermisosRolUseCase }      from '../../application/use-cases/listar-permisos-rol.use-case';
import { AsignarPermisoRolUseCase }      from '../../application/use-cases/asignar-permiso-rol.use-case';
import { ActualizarPermisosRolUseCase }  from '../../application/use-cases/actualizar-permiso-rol.use-case';
import { EliminarPermisoRolUseCase }     from '../../application/use-cases/eliminar-permiso-rol.use-case';

import { ActualizarColegioDto }       from '../../application/dtos/actualizar-colegio.dto';
import { ActualizarConfiguracionDto } from '../../application/dtos/actualizar-configuracion.dto';
import { CrearSedeDto }               from '../../application/dtos/crear-sede.dto';
import { ActualizarSedeDto }          from '../../application/dtos/actualizar-sede.dto';
import { CambiarEstadoDto }           from '../../application/dtos/cambiar-estado.dto';
import { CrearRolDto }                from '../../application/dtos/crear-rol.dto';
import { ActualizarRolDto }           from '../../application/dtos/actualizar-rol.dto';
import { AsignarPermisoDto, ActualizarPermisosDto } from '../../application/dtos/asignar-permiso.dto';

@ApiTags('Colegios')
@Controller('colegios')
export class ColegiosController {
  constructor(
    private readonly obtenerMiColegioUseCase:        ObtenerMiColegioUseCase,
    private readonly actualizarMiColegioUseCase:     ActualizarMiColegioUseCase,
    private readonly obtenerConfiguracionUseCase:    ObtenerConfiguracionUseCase,
    private readonly actualizarConfiguracionUseCase: ActualizarConfiguracionUseCase,
    private readonly obtenerPlanUseCase:             ObtenerPlanUseCase,
    private readonly listarSedesUseCase:             ListarSedesUseCase,
    private readonly crearSedeUseCase:               CrearSedeUseCase,
    private readonly actualizarSedeUseCase:          ActualizarSedeUseCase,
    private readonly cambiarEstadoSedeUseCase:       CambiarEstadoSedeUseCase,
    private readonly listarNivelesUseCase:           ListarNivelesUseCase,
    private readonly cambiarEstadoNivelUseCase:      CambiarEstadoNivelUseCase,
    private readonly listarRolesUseCase:             ListarRolesUseCase,
    private readonly crearRolUseCase:                CrearRolUseCase,
    private readonly actualizarRolUseCase:           ActualizarRolUseCase,
    private readonly eliminarRolUseCase:             EliminarRolUseCase,
    private readonly listarPermisosRolUseCase:       ListarPermisosRolUseCase,
    private readonly asignarPermisoRolUseCase:       AsignarPermisoRolUseCase,
    private readonly actualizarPermisosRolUseCase:   ActualizarPermisosRolUseCase,
    private readonly eliminarPermisoRolUseCase:      EliminarPermisoRolUseCase,
  ) {}

  // ─── Mi Colegio ────────────────────────────────────────────────────────────

  @Get('mi-colegio')
  @Auth()
  @ApiOperation({ summary: 'Ver datos del propio colegio' })
  async miColegio(@Request() req: { user: JwtPayload }) {
    const result = await this.obtenerMiColegioUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('mi-colegio')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar datos del propio colegio (sin nombre ni RUC)' })
  async actualizarMiColegio(
    @Request() req: { user: JwtPayload },
    @Body() dto: ActualizarColegioDto,
  ) {
    const result = await this.actualizarMiColegioUseCase.execute(req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get('mi-colegio/configuracion')
  @Auth()
  @ApiOperation({ summary: 'Ver configuración del colegio' })
  async configuracion(@Request() req: { user: JwtPayload }) {
    const result = await this.obtenerConfiguracionUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('mi-colegio/configuracion')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar configuración del colegio' })
  async actualizarConfiguracion(
    @Request() req: { user: JwtPayload },
    @Body() dto: ActualizarConfiguracionDto,
  ) {
    const result = await this.actualizarConfiguracionUseCase.execute(req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get('mi-colegio/plan')
  @Auth()
  @ApiOperation({ summary: 'Ver plan actual con límites y uso real' })
  async plan(@Request() req: { user: JwtPayload }) {
    const result = await this.obtenerPlanUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  // ─── Sedes ─────────────────────────────────────────────────────────────────

  @Get('mi-colegio/sedes')
  @Auth()
  @ApiOperation({ summary: 'Listar sedes del colegio' })
  async listarSedes(@Request() req: { user: JwtPayload }) {
    const result = await this.listarSedesUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('mi-colegio/sedes')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear sede (valida límite de plan)' })
  async crearSede(
    @Request() req: { user: JwtPayload },
    @Body() dto: CrearSedeDto,
  ) {
    const result = await this.crearSedeUseCase.execute(req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('mi-colegio/sedes/:id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar sede' })
  async actualizarSede(
    @Request() req: { user: JwtPayload },
    @Param('id') sedeId: string,
    @Body() dto: ActualizarSedeDto,
  ) {
    const result = await this.actualizarSedeUseCase.execute(req.user.colegioId!, sedeId, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('mi-colegio/sedes/:id/estado')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar o desactivar sede' })
  async cambiarEstadoSede(
    @Request() req: { user: JwtPayload },
    @Param('id') sedeId: string,
    @Body() dto: CambiarEstadoDto,
  ) {
    const result = await this.cambiarEstadoSedeUseCase.execute(req.user.colegioId!, sedeId, dto.activo);
    if (!result.ok) throw result.error;
    return result.value;
  }

  // ─── Niveles ───────────────────────────────────────────────────────────────

  @Get('mi-colegio/niveles')
  @Auth()
  @ApiOperation({ summary: 'Listar niveles con estado de activación' })
  async listarNiveles(@Request() req: { user: JwtPayload }) {
    const result = await this.listarNivelesUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('mi-colegio/niveles/:nivelMaestroId/estado')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar o desactivar nivel' })
  async cambiarEstadoNivel(
    @Request() req: { user: JwtPayload },
    @Param('nivelMaestroId') nivelMaestroId: string,
    @Body() dto: CambiarEstadoDto,
  ) {
    const result = await this.cambiarEstadoNivelUseCase.execute(req.user.colegioId!, nivelMaestroId, dto.activo);
    if (!result.ok) throw result.error;
    return result.value;
  }

  // ─── Roles ─────────────────────────────────────────────────────────────────

  @Get('mi-colegio/roles')
  @Auth()
  @ApiOperation({ summary: 'Listar roles del colegio' })
  async listarRoles(@Request() req: { user: JwtPayload }) {
    const result = await this.listarRolesUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('mi-colegio/roles')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear rol personalizado' })
  async crearRol(
    @Request() req: { user: JwtPayload },
    @Body() dto: CrearRolDto,
  ) {
    const result = await this.crearRolUseCase.execute(req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('mi-colegio/roles/:id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar nombre o descripción de un rol' })
  async actualizarRol(
    @Request() req: { user: JwtPayload },
    @Param('id') rolId: string,
    @Body() dto: ActualizarRolDto,
  ) {
    const result = await this.actualizarRolUseCase.execute(req.user.colegioId!, rolId, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Delete('mi-colegio/roles/:id')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar rol (no aplica a roles de sistema)' })
  async eliminarRol(
    @Request() req: { user: JwtPayload },
    @Param('id') rolId: string,
  ) {
    const result = await this.eliminarRolUseCase.execute(req.user.colegioId!, rolId);
    if (!result.ok) throw result.error;
  }

  // ─── Permisos de rol ───────────────────────────────────────────────────────

  @Get('mi-colegio/roles/:id/permisos')
  @Auth()
  @ApiOperation({ summary: 'Listar permisos de un rol' })
  async listarPermisosRol(
    @Request() req: { user: JwtPayload },
    @Param('id') rolId: string,
  ) {
    const result = await this.listarPermisosRolUseCase.execute(req.user.colegioId!, rolId);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('mi-colegio/roles/:id/permisos')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Agregar un permiso al rol' })
  async asignarPermiso(
    @Request() req: { user: JwtPayload },
    @Param('id') rolId: string,
    @Body() dto: AsignarPermisoDto,
  ) {
    const result = await this.asignarPermisoRolUseCase.execute(req.user.colegioId!, rolId, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Put('mi-colegio/roles/:id/permisos')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reemplazar todos los permisos de un rol' })
  async actualizarPermisos(
    @Request() req: { user: JwtPayload },
    @Param('id') rolId: string,
    @Body() dto: ActualizarPermisosDto,
  ) {
    const result = await this.actualizarPermisosRolUseCase.execute(req.user.colegioId!, rolId, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Delete('mi-colegio/roles/:id/permisos/:permiso')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Quitar un permiso del rol' })
  async eliminarPermiso(
    @Request() req: { user: JwtPayload },
    @Param('id') rolId: string,
    @Param('permiso') permiso: string,
  ) {
    const result = await this.eliminarPermisoRolUseCase.execute(req.user.colegioId!, rolId, permiso);
    if (!result.ok) throw result.error;
    return result.value;
  }
}