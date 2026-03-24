import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { RegistrarDocenteUseCase }    from '../../application/use-cases/registrar-docente.use-case';
import { ListarDocentesUseCase }      from '../../application/use-cases/listar-docentes.use-case';
import { ObtenerDocenteUseCase }      from '../../application/use-cases/obtener-docente.use-case';
import { ActualizarDocenteUseCase }   from '../../application/use-cases/actualizar-docente.use-case';
import { CambiarEstadoDocenteUseCase } from '../../application/use-cases/cambiar-estado-docente.use-case';
import { AsignarSeccionUseCase }      from '../../application/use-cases/asignar-seccion.use-case';
import { RemoverAsignacionUseCase }   from '../../application/use-cases/remover-asignacion.use-case';
import type { EstadoDocente }         from '../../domain/entities/docente.entity';

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
  async listar(@Request() req: { user: JwtPayload }, @Query('estado') estado?: EstadoDocente) {
    const result = await this.listarDocentesUseCase.execute(req.user.colegioId!, estado);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo docente' })
  async registrar(@Request() req: { user: JwtPayload }, @Body() body: any) {
    const result = await this.registrarDocenteUseCase.execute(req.user.colegioId!, {
      ...body,
      fechaNac: new Date(body.fechaNac),
    });
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener docente por ID' })
  async obtener(@Request() req: { user: JwtPayload }, @Param('id') id: string) {
    const result = await this.obtenerDocenteUseCase.execute(id, req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Actualizar especialidad o sede del docente' })
  async actualizar(@Request() req: { user: JwtPayload }, @Param('id') id: string, @Body() body: any) {
    const result = await this.actualizarDocenteUseCase.execute(id, req.user.colegioId!, body);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id/estado')
  @Auth()
  @ApiOperation({ summary: 'Cambiar estado del docente (ACTIVO/INACTIVO/LICENCIA)' })
  async cambiarEstado(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() body: { estado: EstadoDocente },
  ) {
    const result = await this.cambiarEstadoDocenteUseCase.execute(id, req.user.colegioId!, body.estado);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post(':id/asignaciones')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar docente a sección y asignatura' })
  async asignarSeccion(
    @Request() req: { user: JwtPayload },
    @Param('id') docenteId: string,
    @Body() body: any,
  ) {
    const result = await this.asignarSeccionUseCase.execute(docenteId, req.user.colegioId!, body);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Delete('asignaciones/:asignacionId')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover asignación de docente' })
  async removerAsignacion(
    @Request() req: { user: JwtPayload },
    @Param('asignacionId') asignacionId: string,
  ) {
    const result = await this.removerAsignacionUseCase.execute(asignacionId, req.user.colegioId!);
    if (!result.ok) throw result.error;
  }
}
