// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Controller exclusivo de PLATFORM_ADMIN para operaciones
//   administrativas sobre cualquier colegio del sistema.
//
// POR QUÉ CONTROLLER SEPARADO Y NO UN MÉTODO MÁS EN ColegiosController:
//   PLATFORM_ADMIN y SUPER_ADMIN son actores completamente distintos.
//   SUPER_ADMIN opera sobre "mi colegio" — identificado por su JWT.
//   PLATFORM_ADMIN opera sobre cualquier colegio — recibe :id en la ruta.
//   Distintos actores, distinta autorización, distintas rutas → distintos controllers.
//   Principio SOLID: Single Responsibility — cada controller tiene un actor.
//
// AUTORIZACIÓN:
//   @SoloPlatformAdmin() en cada método delega la verificación al guard.
//   Sin un solo if en el controller — responsabilidad donde corresponde.
//
// RUTAS:
//   GET  /colegios              → listar todos
//   PATCH /colegios/:id/plan    → cambiar plan
//   PATCH /colegios/:id/estado  → cambiar estado
//   (mismo prefijo /colegios — misma API, distinto controller internamente)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

const COLEGIO_ADMIN_EXAMPLE = {
  id:          'uuid-colegio',
  nombre:      'Colegio San Martín SAC',
  ruc:         '20123456789',
  direccion:   'Av. Educación 456, Lima',
  email:       'admin@colegio.edu.pe',
  estado:      'ACTIVO',
  plan:        'PREMIUM',
  planVenceEn: '2027-01-01T00:00:00.000Z',
  createdAt:   '2026-01-01T00:00:00.000Z',
  updatedAt:   '2026-01-01T00:00:00.000Z',
};

import { SoloPlatformAdmin } from '@modules/auth/infrastructure/guards/auth.guard';

import { ListarColegiosUseCase }       from '../../application/use-cases/listar-colegios.use-case';
import { CambiarPlanUseCase }          from '../../application/use-cases/cambiar-plan.use-case';
import { CambiarEstadoColegioUseCase } from '../../application/use-cases/cambiar-estado-colegio.use-case';

import { CambiarPlanDto }          from '../../application/dtos/cambiar-plan.dto';
import { CambiarEstadoColegioDto } from '../../application/dtos/cambiar-estado-colegio.dto';

@ApiTags('Admin — Colegios')
@Controller('colegios')
export class AdminColegiosController {
  constructor(
    private readonly listarColegiosUseCase:       ListarColegiosUseCase,
    private readonly cambiarPlanUseCase:          CambiarPlanUseCase,
    private readonly cambiarEstadoColegioUseCase: CambiarEstadoColegioUseCase,
  ) {}

  @Get()
  @SoloPlatformAdmin()
  @ApiOperation({ summary: 'Listar todos los colegios del sistema' })
  @ApiOkResponse({ schema: { type: 'array', items: { example: COLEGIO_ADMIN_EXAMPLE } } })
  async listarColegios() {
    const result = await this.listarColegiosUseCase.execute();
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id/plan')
  @SoloPlatformAdmin()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar plan de un colegio' })
  @ApiOkResponse({ schema: { example: COLEGIO_ADMIN_EXAMPLE } })
  async cambiarPlan(
    @Param('id') colegioId: string,
    @Body() dto: CambiarPlanDto,
  ) {
    const result = await this.cambiarPlanUseCase.execute(colegioId, dto.plan);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id/estado')
  @SoloPlatformAdmin()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar, suspender o desactivar un colegio' })
  @ApiOkResponse({ schema: { example: COLEGIO_ADMIN_EXAMPLE } })
  async cambiarEstado(
    @Param('id') colegioId: string,
    @Body() dto: CambiarEstadoColegioDto,
  ) {
    const result = await this.cambiarEstadoColegioUseCase.execute(colegioId, dto.estado);
    if (!result.ok) throw result.error;
    return result.value;
  }
}