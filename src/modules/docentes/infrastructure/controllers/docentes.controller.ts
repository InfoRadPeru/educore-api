import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { RegistrarDocenteUseCase }    from '../../application/use-cases/registrar-docente.use-case';
import { ListarDocentesUseCase }      from '../../application/use-cases/listar-docentes.use-case';
import { ObtenerDocenteUseCase }      from '../../application/use-cases/obtener-docente.use-case';
import { ActualizarDocenteUseCase }   from '../../application/use-cases/actualizar-docente.use-case';
import { CambiarEstadoDocenteUseCase } from '../../application/use-cases/cambiar-estado-docente.use-case';
import { AsignarSeccionUseCase }      from '../../application/use-cases/asignar-seccion.use-case';
import { RemoverAsignacionUseCase }   from '../../application/use-cases/remover-asignacion.use-case';

import {
  RegistrarDocenteDto,
  ActualizarDocenteDto,
  AsignarSeccionDto,
  CambiarEstadoDocenteDto,
} from '../../application/dtos/docente.dto';
import type { EstadoDocente } from '../../domain/entities/docente.entity';

// ─── Ejemplos de respuesta ────────────────────────────────────────────────────

const DOCENTE_EXAMPLE = {
  id: 'uuid-docente',
  personaId: 'uuid-persona',
  colegioId: 'uuid-colegio',
  sedeId: null,
  especialidad: 'Matemáticas',
  estado: 'ACTIVO',
  dni: '12345678',
  nombres: 'Juan Carlos',
  apellidos: 'Pérez García',
  telefono: '987654321',
  usuarioId: 'uuid-usuario',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const ASIGNACION_EXAMPLE = {
  id: 'uuid-asignacion',
  docenteId: 'uuid-docente',
  seccionId: 'uuid-seccion',
  colegioAsignaturaId: 'uuid-asignatura',
  asignaturaNombre: 'Matemáticas',
  añoAcademico: 2026,
  esTutor: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

@ApiTags('Docentes')
@Controller('docentes')
export class DocentesController {
  constructor(
    private readonly registrarDocenteUseCase:     RegistrarDocenteUseCase,
    private readonly listarDocentesUseCase:       ListarDocentesUseCase,
    private readonly obtenerDocenteUseCase:       ObtenerDocenteUseCase,
    private readonly actualizarDocenteUseCase:    ActualizarDocenteUseCase,
    private readonly cambiarEstadoDocenteUseCase: CambiarEstadoDocenteUseCase,
    private readonly asignarSeccionUseCase:       AsignarSeccionUseCase,
    private readonly removerAsignacionUseCase:    RemoverAsignacionUseCase,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Listar docentes del colegio' })
  @ApiQuery({ name: 'estado', enum: ['ACTIVO', 'INACTIVO', 'LICENCIA'], required: false })
  @ApiOkResponse({ schema: { type: 'array', items: { example: DOCENTE_EXAMPLE } } })
  async listar(@Request() req: { user: JwtPayload }, @Query('estado') estado?: EstadoDocente) {
    const result = await this.listarDocentesUseCase.execute(req.user.colegioId!, estado);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo docente' })
  @ApiCreatedResponse({
    schema: {
      example: {
        docente: DOCENTE_EXAMPLE,
        passwordGenerado: 'Temp@1234',
      },
    },
    description: 'passwordGenerado es null si ya tenía usuario o se envió password explícito',
  })
  async registrar(@Request() req: { user: JwtPayload }, @Body() dto: RegistrarDocenteDto) {
    const result = await this.registrarDocenteUseCase.execute(req.user.colegioId!, {
      ...dto,
      fechaNac: new Date(dto.fechaNac),
    });
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener docente por ID' })
  @ApiOkResponse({ schema: { example: DOCENTE_EXAMPLE } })
  async obtener(@Request() req: { user: JwtPayload }, @Param('id') id: string) {
    const result = await this.obtenerDocenteUseCase.execute(id, req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Actualizar especialidad o sede del docente' })
  @ApiOkResponse({ schema: { example: DOCENTE_EXAMPLE } })
  async actualizar(@Request() req: { user: JwtPayload }, @Param('id') id: string, @Body() dto: ActualizarDocenteDto) {
    const result = await this.actualizarDocenteUseCase.execute(id, req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id/estado')
  @Auth()
  @ApiOperation({ summary: 'Cambiar estado del docente (ACTIVO/INACTIVO/LICENCIA)' })
  @ApiOkResponse({ schema: { example: DOCENTE_EXAMPLE } })
  async cambiarEstado(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: CambiarEstadoDocenteDto,
  ) {
    const result = await this.cambiarEstadoDocenteUseCase.execute(id, req.user.colegioId!, dto.estado);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post(':id/asignaciones')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar docente a sección y asignatura' })
  @ApiCreatedResponse({ schema: { example: ASIGNACION_EXAMPLE } })
  async asignarSeccion(
    @Request() req: { user: JwtPayload },
    @Param('id') docenteId: string,
    @Body() dto: AsignarSeccionDto,
  ) {
    const result = await this.asignarSeccionUseCase.execute(docenteId, req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Delete('asignaciones/:asignacionId')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover asignación de docente' })
  @ApiNoContentResponse({ description: 'Asignación eliminada' })
  async removerAsignacion(
    @Request() req: { user: JwtPayload },
    @Param('asignacionId') asignacionId: string,
  ) {
    const result = await this.removerAsignacionUseCase.execute(asignacionId, req.user.colegioId!);
    if (!result.ok) throw result.error;
  }
}
