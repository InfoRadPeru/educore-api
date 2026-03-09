// Qué es: Controller HTTP del módulo Colegios.
// Principio SOLID: Single Responsibility — recibe request, llama use case, retorna response. Cero lógica de negocio.
// Por qué dos grupos de rutas en un controller: SUPER_ADMIN opera sobre "mi-colegio" (identificado por JWT),
// PLATFORM_ADMIN opera sobre cualquier colegio por id. Son responsabilidades distintas pero del mismo dominio.

import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Request, UseFilters } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@shared/infrastructure/filters/http-exception.filter';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { ObtenerMiColegioUseCase }      from '../../application/use-cases/obtener-mi-colegio.use-case';
import { ActualizarMiColegioUseCase }   from '../../application/use-cases/actualizar-mi-colegio.use-case';
import { ObtenerConfiguracionUseCase }  from '../../application/use-cases/obtener-configuracion.use-case';
import { ActualizarConfiguracionUseCase } from '../../application/use-cases/actualizar-configuracion.use-case';
import { ObtenerPlanUseCase }           from '../../application/use-cases/obtener-plan.use-case';
import { ListarSedesUseCase }           from '../../application/use-cases/listar-sedes.use-case';
import { CrearSedeUseCase }             from '../../application/use-cases/crear-sede.use-case';
import { ActualizarSedeUseCase }        from '../../application/use-cases/actualizar-sede.use-case';
import { CambiarEstadoSedeUseCase }     from '../../application/use-cases/cambiar-estado-sede.use-case';
import { ListarNivelesUseCase }         from '../../application/use-cases/listar-niveles.use-case';
import { CambiarEstadoNivelUseCase }    from '../../application/use-cases/cambiar-estado-nivel.use-case';
import { ListarColegiosUseCase }        from '../../application/use-cases/listar-colegios.use-case';
import { CambiarPlanUseCase }           from '../../application/use-cases/cambiar-plan.use-case';
import { CambiarEstadoColegioUseCase }  from '../../application/use-cases/cambiar-estado-colegio.use-case';

import { ActualizarColegioDto }       from '../../application/dtos/actualizar-colegio.dto';
import { ActualizarConfiguracionDto } from '../../application/dtos/actualizar-configuracion.dto';
import { CrearSedeDto }               from '../../application/dtos/crear-sede.dto';
import { ActualizarSedeDto }          from '../../application/dtos/actualizar-sede.dto';
import { CambiarEstadoDto }           from '../../application/dtos/cambiar-estado.dto';
import { CambiarPlanDto }             from '../../application/dtos/cambiar-plan.dto';
import { CambiarEstadoColegioDto }    from '../../application/dtos/cambiar-estado-colegio.dto';
import { Auth } from '../guards/colegios.guard';

@ApiTags('Colegios')
@UseFilters(HttpExceptionFilter)
@Controller('colegios')
export class ColegiosController {
  constructor(
    private readonly obtenerMiColegioUseCase:       ObtenerMiColegioUseCase,
    private readonly actualizarMiColegioUseCase:    ActualizarMiColegioUseCase,
    private readonly obtenerConfiguracionUseCase:   ObtenerConfiguracionUseCase,
    private readonly actualizarConfiguracionUseCase: ActualizarConfiguracionUseCase,
    private readonly obtenerPlanUseCase:            ObtenerPlanUseCase,
    private readonly listarSedesUseCase:            ListarSedesUseCase,
    private readonly crearSedeUseCase:              CrearSedeUseCase,
    private readonly actualizarSedeUseCase:         ActualizarSedeUseCase,
    private readonly cambiarEstadoSedeUseCase:      CambiarEstadoSedeUseCase,
    private readonly listarNivelesUseCase:          ListarNivelesUseCase,
    private readonly cambiarEstadoNivelUseCase:     CambiarEstadoNivelUseCase,
    private readonly listarColegiosUseCase:         ListarColegiosUseCase,
    private readonly cambiarPlanUseCase:            CambiarPlanUseCase,
    private readonly cambiarEstadoColegioUseCase:   CambiarEstadoColegioUseCase,
  ) {}

  // ─── SUPER_ADMIN: Mi Colegio ───────────────────────────────────────────────

  @Get('mi-colegio')
  @Auth()
  @ApiOperation({ summary: 'Ver datos del colegio propio' })
  async miColegio(@Request() req: { user: JwtPayload }) {
    const result = await this.obtenerMiColegioUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('mi-colegio')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar datos del colegio (sin nombre ni RUC)' })
  async actualizarMiColegio(@Request() req: { user: JwtPayload }, @Body() dto: ActualizarColegioDto) {
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
  async actualizarConfiguracion(@Request() req: { user: JwtPayload }, @Body() dto: ActualizarConfiguracionDto) {
    const result = await this.actualizarConfiguracionUseCase.execute(req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get('mi-colegio/plan')
  @Auth()
  @ApiOperation({ summary: 'Ver plan actual con límites y uso' })
  async plan(@Request() req: { user: JwtPayload }) {
    const result = await this.obtenerPlanUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  // ─── SUPER_ADMIN: Sedes ────────────────────────────────────────────────────

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
  async crearSede(@Request() req: { user: JwtPayload }, @Body() dto: CrearSedeDto) {
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

  // ─── SUPER_ADMIN: Niveles ──────────────────────────────────────────────────

  @Get('mi-colegio/niveles')
  @Auth()
  @ApiOperation({ summary: 'Listar niveles del catálogo con estado de activación' })
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

  // ─── PLATFORM_ADMIN ────────────────────────────────────────────────────────

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Listar todos los colegios (PLATFORM_ADMIN)' })
  async listarColegios(@Request() req: { user: JwtPayload }) {
    // Solo PLATFORM_ADMIN tiene esPlatformAdmin = true, el guard lo valida
    if (!req.user.esPlatformAdmin) throw { code: 'FORBIDDEN', message: 'Solo PLATFORM_ADMIN' };
    const result = await this.listarColegiosUseCase.execute();
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id/plan')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar plan de un colegio (PLATFORM_ADMIN)' })
  async cambiarPlan(
    @Request() req: { user: JwtPayload },
    @Param('id') colegioId: string,
    @Body() dto: CambiarPlanDto,
  ) {
    if (!req.user.esPlatformAdmin) throw { code: 'FORBIDDEN', message: 'Solo PLATFORM_ADMIN' };
    const result = await this.cambiarPlanUseCase.execute(colegioId, dto.plan);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id/estado')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar estado de un colegio (PLATFORM_ADMIN)' })
  async cambiarEstadoColegio(
    @Request() req: { user: JwtPayload },
    @Param('id') colegioId: string,
    @Body() dto: CambiarEstadoColegioDto,
  ) {
    if (!req.user.esPlatformAdmin) throw { code: 'FORBIDDEN', message: 'Solo PLATFORM_ADMIN' };
    const result = await this.cambiarEstadoColegioUseCase.execute(colegioId, dto.estado);
    if (!result.ok) throw result.error;
    return result.value;
  }
}