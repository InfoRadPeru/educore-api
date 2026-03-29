import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Request } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { RegistrarApoderadoUseCase } from '../../application/use-cases/registrar-apoderado.use-case';
import { ObtenerApoderadoUseCase }   from '../../application/use-cases/obtener-apoderado.use-case';
import { ListarApoderadosUseCase }   from '../../application/use-cases/listar-apoderados.use-case';
import { AsignarAlumnoUseCase }      from '../../application/use-cases/asignar-alumno.use-case';
import { DesvincularAlumnoUseCase }  from '../../application/use-cases/desvincular-alumno.use-case';
import type { TipoParentesco }       from '../../domain/entities/apoderado.entity';

export class RegistrarApoderadoBodyDto {
  @IsString() @IsNotEmpty()
  dni: string;

  @IsString() @IsNotEmpty()
  nombres: string;

  @IsString() @IsNotEmpty()
  apellidos: string;

  @IsDateString()
  fechaNac: string;

  @IsEnum(['MASCULINO', 'FEMENINO', 'OTRO'])
  genero: 'MASCULINO' | 'FEMENINO' | 'OTRO';

  @IsString() @IsOptional()
  telefono?: string;

  @IsBoolean()
  crearAcceso: boolean;

  @IsString()
  @ValidateIf(o => o.crearAcceso === true)
  password?: string;
}

export class AsignarAlumnoBodyDto {
  @IsString() @IsNotEmpty()
  alumnoId: string;

  @IsString() @IsNotEmpty()
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
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        example: {
          id: 'uuid-apoderado', personaId: 'uuid-persona', colegioId: 'uuid-colegio',
          dni: '12345678', nombres: 'María', apellidos: 'López', telefono: '987654321',
          alumnos: [{ alumnoId: 'uuid-alumno', parentesco: 'MADRE' }],
          usuarioId: 'uuid-usuario',
          createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
        },
      },
    },
  })
  async listar(@Request() req: { user: JwtPayload }) {
    const result = await this.listarApoderadosUseCase.execute(req.user.colegioId!);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo apoderado' })
  @ApiCreatedResponse({
    description: 'passwordGenerado es null si ya tenía usuario o se envió password explícito',
    schema: {
      example: {
        apoderado: {
          id: 'uuid-apoderado', personaId: 'uuid-persona', colegioId: 'uuid-colegio',
          dni: '12345678', nombres: 'María', apellidos: 'López', telefono: '987654321',
          usuarioId: 'uuid-usuario',
          createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
        },
        passwordGenerado: 'Temp@1234',
      },
    },
  })
  async registrar(@Request() req: { user: JwtPayload }, @Body() dto: RegistrarApoderadoBodyDto) {
    const result = await this.registrarApoderadoUseCase.execute({
      ...dto,
      colegioId: req.user.colegioId!,
      fechaNac:  new Date(dto.fechaNac),
    });
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener apoderado por ID' })
  @ApiOkResponse({
    schema: {
      example: {
        id: 'uuid-apoderado', personaId: 'uuid-persona', colegioId: 'uuid-colegio',
        dni: '12345678', nombres: 'María', apellidos: 'López', telefono: '987654321',
        alumnos: [{ alumnoId: 'uuid-alumno', parentesco: 'MADRE' }],
        usuarioId: 'uuid-usuario',
        createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
      },
    },
  })
  async obtener(@Param('id') id: string) {
    const result = await this.obtenerApoderadoUseCase.execute(id);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post(':id/alumnos')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar alumno al apoderado' })
  @ApiCreatedResponse({
    schema: { example: { id: 'uuid-vinculo', apoderadoId: 'uuid-apoderado', alumnoId: 'uuid-alumno', parentesco: 'MADRE', createdAt: '2026-01-01T00:00:00.000Z' } },
  })
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
  @ApiNoContentResponse({ description: 'Vínculo eliminado' })
  async desvincularAlumno(@Param('id') apoderadoId: string, @Param('alumnoId') alumnoId: string) {
    const result = await this.desvincularAlumnoUseCase.execute(apoderadoId, alumnoId);
    if (!result.ok) throw result.error;
  }
}
