import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

const ALUMNO_EXAMPLE = {
  id:          'uuid-alumno',
  colegioId:   'uuid-colegio',
  personaId:   'uuid-persona',
  dni:         '87654321',
  nombres:     'María',
  apellidos:   'García López',
  fechaNac:    '2010-05-15',
  genero:      'FEMENINO',
  telefono:    null,
  estado:      'ACTIVO',
  createdAt:   '2026-01-01T00:00:00.000Z',
  updatedAt:   '2026-01-01T00:00:00.000Z',
};
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { RegistrarAlumnoUseCase }     from '../../application/use-cases/registrar-alumno.use-case';
import { ListarAlumnosUseCase }       from '../../application/use-cases/listar-alumnos.use-case';
import { ObtenerAlumnoUseCase }       from '../../application/use-cases/obtener-alumno.use-case';
import { ActualizarAlumnoUseCase }    from '../../application/use-cases/actualizar-alumno.use-case';
import { CambiarEstadoAlumnoUseCase } from '../../application/use-cases/cambiar-estado-alumno.use-case';

import { RegistrarAlumnoDto }     from '../../application/dtos/registrar-alumno.dto';
import { ActualizarAlumnoDto }    from '../../application/dtos/actualizar-alumno.dto';
import { CambiarEstadoAlumnoDto } from '../../application/dtos/cambiar-estado-alumno.dto';
import type { EstadoAlumno }      from '../../domain/entities/alumno.entity';

@ApiTags('Alumnos')
@Controller('alumnos')
export class AlumnosController {
  constructor(
    private readonly registrarAlumnoUseCase:     RegistrarAlumnoUseCase,
    private readonly listarAlumnosUseCase:       ListarAlumnosUseCase,
    private readonly obtenerAlumnoUseCase:       ObtenerAlumnoUseCase,
    private readonly actualizarAlumnoUseCase:    ActualizarAlumnoUseCase,
    private readonly cambiarEstadoAlumnoUseCase: CambiarEstadoAlumnoUseCase,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Listar alumnos del colegio' })
  @ApiQuery({ name: 'estado', enum: ['ACTIVO', 'INACTIVO', 'RETIRADO'], required: false })
  @ApiOkResponse({ schema: { type: 'array', items: { example: ALUMNO_EXAMPLE } } })
  async listar(@Request() req: { user: JwtPayload }, @Query('estado') estado?: EstadoAlumno) {
    const result = await this.listarAlumnosUseCase.execute(req.user.colegioId!, estado);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo alumno' })
  @ApiCreatedResponse({ schema: { example: ALUMNO_EXAMPLE } })
  async registrar(@Request() req: { user: JwtPayload }, @Body() dto: RegistrarAlumnoDto) {
    const result = await this.registrarAlumnoUseCase.execute(req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener alumno por ID' })
  @ApiOkResponse({ schema: { example: ALUMNO_EXAMPLE } })
  async obtener(@Request() req: { user: JwtPayload }, @Param('id') id: string) {
    const result = await this.obtenerAlumnoUseCase.execute(req.user.colegioId!, id);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar datos personales del alumno' })
  @ApiOkResponse({ schema: { example: ALUMNO_EXAMPLE } })
  async actualizar(@Request() req: { user: JwtPayload }, @Param('id') id: string, @Body() dto: ActualizarAlumnoDto) {
    const result = await this.actualizarAlumnoUseCase.execute(req.user.colegioId!, id, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id/estado')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar estado del alumno (ACTIVO / INACTIVO / RETIRADO)' })
  @ApiOkResponse({ schema: { example: ALUMNO_EXAMPLE } })
  async cambiarEstado(@Request() req: { user: JwtPayload }, @Param('id') id: string, @Body() dto: CambiarEstadoAlumnoDto) {
    const result = await this.cambiarEstadoAlumnoUseCase.execute(req.user.colegioId!, id, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }
}
