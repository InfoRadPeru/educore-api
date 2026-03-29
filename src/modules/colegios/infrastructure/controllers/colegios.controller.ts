// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Controller de SUPER_ADMIN — gestión del propio colegio.
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
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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

// ─── Ejemplos de respuesta ────────────────────────────────────────────────────

const COLEGIO_EXAMPLE = {
  id: 'uuid-colegio',
  nombre: 'Colegio Ejemplo SAC',
  ruc: '20123456789',
  direccion: 'Av. Educación 456, Lima',
  telefono: '01-234567',
  email: 'admin@colegio.edu.pe',
  estado: 'ACTIVO',
  plan: 'PREMIUM',
  planVenceEn: '2027-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const SEDE_EXAMPLE = {
  id: 'uuid-sede',
  colegioId: 'uuid-colegio',
  nombre: 'Sede Central',
  direccion: 'Av. Principal 123, Lima',
  telefono: '01-234567',
  email: 'sede@colegio.edu.pe',
  activo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const NIVEL_ACTIVADO_EXAMPLE = {
  tipo: 'activado',
  id: 'uuid-nivel',
  nivelMaestroId: 'uuid-nivel-maestro',
  nombre: 'Primaria',
  orden: 2,
  activo: true,
  turnos: ['MAÑANA', 'TARDE'],
};

const NIVEL_DISPONIBLE_EXAMPLE = {
  tipo: 'disponible',
  nivelMaestroId: 'uuid-nivel-maestro',
  nombre: 'Inicial',
  orden: 1,
};

const ROL_EXAMPLE = {
  id: 'uuid-rol',
  colegioId: 'uuid-colegio',
  nombre: 'COORDINADOR',
  descripcion: 'Coordinador académico',
  esSistema: false,
  permisos: ['ALUMNOS_VER', 'NOTAS_VER'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const CONFIGURACION_EXAMPLE = {
  colegioId: 'uuid-colegio',
  añoAcademicoActual: 2026,
  logoUrl: 'https://cdn.example.com/logo.png',
  colorPrimario: '#1a73e8',
};

const PLAN_EXAMPLE = {
  plan: 'PREMIUM',
  planVenceEn: '2027-01-01T00:00:00.000Z',
  limites: {
    alumnos: 500,
    docentes: 50,
    sedes: 3,
  },
  uso: {
    alumnos: 120,
    docentes: 18,
    sedes: 1,
  },
};

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
  @ApiOkResponse({ schema: { example: COLEGIO_EXAMPLE } })
  async miColegio(@Request() req: { user: JwtPayload }) {
    const result = await this.obtenerMiColegioUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('mi-colegio')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar datos del propio colegio (sin nombre ni RUC)' })
  @ApiOkResponse({ schema: { example: COLEGIO_EXAMPLE } })
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
  @ApiOkResponse({ schema: { example: CONFIGURACION_EXAMPLE } })
  async configuracion(@Request() req: { user: JwtPayload }) {
    const result = await this.obtenerConfiguracionUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('mi-colegio/configuracion')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar configuración del colegio' })
  @ApiOkResponse({ schema: { example: CONFIGURACION_EXAMPLE } })
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
  @ApiOkResponse({ schema: { example: PLAN_EXAMPLE } })
  async plan(@Request() req: { user: JwtPayload }) {
    const result = await this.obtenerPlanUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  // ─── Sedes ─────────────────────────────────────────────────────────────────

  @Get('mi-colegio/sedes')
  @Auth()
  @ApiOperation({ summary: 'Listar sedes del colegio' })
  @ApiOkResponse({ schema: { type: 'array', items: { example: SEDE_EXAMPLE } } })
  async listarSedes(@Request() req: { user: JwtPayload }) {
    const result = await this.listarSedesUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('mi-colegio/sedes')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear sede (valida límite de plan)' })
  @ApiCreatedResponse({ schema: { example: SEDE_EXAMPLE } })
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
  @ApiOkResponse({ schema: { example: SEDE_EXAMPLE } })
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
  @ApiOkResponse({ schema: { example: SEDE_EXAMPLE } })
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
  @ApiOkResponse({
    description: 'Cada nivel puede ser "disponible" (sin activar) o "activado".',
    schema: {
      type: 'array',
      items: {
        oneOf: [
          { example: NIVEL_DISPONIBLE_EXAMPLE },
          { example: NIVEL_ACTIVADO_EXAMPLE },
        ],
      },
    },
  })
  async listarNiveles(@Request() req: { user: JwtPayload }) {
    const result = await this.listarNivelesUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('mi-colegio/niveles/:nivelMaestroId/estado')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar o desactivar nivel' })
  @ApiOkResponse({ schema: { example: NIVEL_ACTIVADO_EXAMPLE } })
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
  @ApiOkResponse({ schema: { type: 'array', items: { example: ROL_EXAMPLE } } })
  async listarRoles(@Request() req: { user: JwtPayload }) {
    const result = await this.listarRolesUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('mi-colegio/roles')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear rol personalizado' })
  @ApiCreatedResponse({ schema: { example: ROL_EXAMPLE } })
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
  @ApiOkResponse({ schema: { example: ROL_EXAMPLE } })
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
  @ApiNoContentResponse({ description: 'Rol eliminado' })
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
  @ApiOkResponse({
    description: 'Lista de strings con los permisos asignados',
    schema: { example: ['ALUMNOS_VER', 'ALUMNOS_EDITAR', 'NOTAS_VER'] },
  })
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
  @ApiOkResponse({ schema: { example: ROL_EXAMPLE } })
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
  @ApiOkResponse({ schema: { example: ROL_EXAMPLE } })
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
  @ApiOkResponse({ schema: { example: ROL_EXAMPLE } })
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
