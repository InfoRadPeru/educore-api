import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Request } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { RegistrarApoderadoUseCase } from '../../application/use-cases/registrar-apoderado.use-case';
import { ObtenerApoderadoUseCase }   from '../../application/use-cases/obtener-apoderado.use-case';
import { ListarApoderadosUseCase }   from '../../application/use-cases/listar-apoderados.use-case';
import { AsignarAlumnoUseCase }      from '../../application/use-cases/asignar-alumno.use-case';
import { DesvincularAlumnoUseCase }  from '../../application/use-cases/desvincular-alumno.use-case';
import type { TipoParentesco }       from '../../domain/entities/apoderado.entity';

export class RegistrarApoderadoBodyDto {
  dni:          string;
  nombres:      string;
  apellidos:    string;
  fechaNac:     string;
  genero:       'MASCULINO' | 'FEMENINO' | 'OTRO';
  telefono?:    string;
  crearAcceso:  boolean;
  password?:    string;
}

export class AsignarAlumnoBodyDto {
  alumnoId:   string;
  parentesco: TipoParentesco;
}

@ApiTags('Apoderados')
@Controller('apoderados')
export class ApoderadosController {
  constructor(
    private readonly registrarApoderadoUseCase: RegistrarApoderadoUseCase,
    private readonly obtenerApoderadoUseCase:   ObtenerApoderadoUseCase,
    private readonly listarApoderadosUseCase:   ListarApoderadosUseCase,
    private readonly asignarAlumnoUseCase:      AsignarAlumnoUseCase,
    private readonly desvincularAlumnoUseCase:  DesvincularAlumnoUseCase,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Listar apoderados del colegio' })
  async listar(@Request() req: { user: JwtPayload }) {
    const result = await this.listarApoderadosUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo apoderado' })
  async registrar(@Body() dto: RegistrarApoderadoBodyDto) {
    const result = await this.registrarApoderadoUseCase.execute({
      ...dto,
      fechaNac: new Date(dto.fechaNac),
    });
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener apoderado por ID' })
  async obtener(@Param('id') id: string) {
    const result = await this.obtenerApoderadoUseCase.execute(id);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post(':id/alumnos')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar alumno al apoderado' })
  async asignarAlumno(
    @Request() req: { user: JwtPayload },
    @Param('id') apoderadoId: string,
    @Body() dto: AsignarAlumnoBodyDto,
  ) {
    const result = await this.asignarAlumnoUseCase.execute(req.user.colegioId!, {
      apoderadoId,
      alumnoId:   dto.alumnoId,
      parentesco: dto.parentesco,
    });
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Delete(':id/alumnos/:alumnoId')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desvincular alumno del apoderado' })
  async desvincularAlumno(@Param('id') apoderadoId: string, @Param('alumnoId') alumnoId: string) {
    const result = await this.desvincularAlumnoUseCase.execute(apoderadoId, alumnoId);
    if (!result.ok) throw result.error;
  }
}
