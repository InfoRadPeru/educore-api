import {
  BadRequestException, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Post, Query, Request,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

const PUBLICACION_EXAMPLE = {
  id:             'uuid-publicacion',
  periodoId:      'uuid-periodo',
  seccionId:      'uuid-seccion',
  publicadoEn:    '2026-03-28T10:00:00.000Z',
  publicadoPorId: 'uuid-usuario',
};

const BOLETIN_EXAMPLE = {
  alumnoId:     'uuid-alumno',
  alumnoNombre: 'Carlos Pérez García',
  año:          2026,
  periodos: [
    {
      periodoId:    'uuid-periodo',
      periodoNombre:'Bimestre 1',
      publicado:    true,
      asignaturas: [
        {
          asignatura:  'Matemáticas',
          promedio:    17.5,
          categorias: [{ nombre: 'Exámenes', peso: 60, promedio: 18 }],
        },
      ],
    },
  ],
};
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';
import { AppError } from '@shared/domain/result';

import { ObtenerBoletinAlumnoUseCase }   from '../../application/use-cases/obtener-boletin-alumno.use-case';
import { ObtenerBoletinApoderadoUseCase } from '../../application/use-cases/obtener-boletin-apoderado.use-case';
import { PublicarBoletinSeccionUseCase }  from '../../application/use-cases/publicar-boletin-seccion.use-case';
import { DespublicarBoletinUseCase }      from '../../application/use-cases/despublicar-boletin.use-case';
import { ListarPublicacionesUseCase }     from '../../application/use-cases/listar-publicaciones.use-case';
import { PublicarBoletinDto } from '../../application/dtos/boletin.dto';
import { Body } from '@nestjs/common';

@ApiTags('Boletín')
@Controller('boletin')
export class BoletinController {
  constructor(
    private readonly obtenerBoletinAlumnoUseCase:   ObtenerBoletinAlumnoUseCase,
    private readonly obtenerBoletinApoderadoUseCase: ObtenerBoletinApoderadoUseCase,
    private readonly publicarBoletinUseCase:         PublicarBoletinSeccionUseCase,
    private readonly despublicarBoletinUseCase:      DespublicarBoletinUseCase,
    private readonly listarPublicacionesUseCase:     ListarPublicacionesUseCase,
  ) {}

  // ─── SUPER_ADMIN / Docente ─────────────────────────────────────────────────

  @Get('alumno/:alumnoId')
  @Auth()
  @ApiOperation({ summary: 'Obtener boletín completo de un alumno' })
  @ApiQuery({ name: 'año', type: Number, example: 2026 })
  @ApiOkResponse({ schema: { example: BOLETIN_EXAMPLE } })
  async obtenerBoletinAlumno(
    @Param('alumnoId') alumnoId: string,
    @Query('año') año: string,
    @Request() req: { user: JwtPayload },
  ) {
    const colegioId = req.user.colegioId!;
    const result = await this.obtenerBoletinAlumnoUseCase.execute(
      alumnoId,
      parseInt(año, 10),
      colegioId,
    );
    if (!result.ok) throw result.error;
    return result.value;
  }

  // ─── Publicar boletín ──────────────────────────────────────────────────────

  @Post('publicar')
  @Auth()
  @ApiOperation({ summary: 'Publicar boletín de una sección para un periodo' })
  @ApiOkResponse({ schema: { example: PUBLICACION_EXAMPLE } })
  async publicarBoletin(
    @Body() dto: PublicarBoletinDto,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.publicarBoletinUseCase.execute(
      dto.periodoId,
      dto.seccionId,
      req.user.sub,
    );
    if (!result.ok) throw result.error;
    return {
      id:            result.value.id,
      periodoId:     result.value.periodoId,
      seccionId:     result.value.seccionId,
      publicadoEn:   result.value.publicadoEn.toISOString(),
      publicadoPorId: result.value.publicadoPorId,
    };
  }

  // ─── Despublicar boletín ───────────────────────────────────────────────────

  @Delete('publicar/:periodoId/:seccionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  @ApiOperation({ summary: 'Retirar publicación del boletín' })
  @ApiNoContentResponse({ description: 'Publicación retirada' })
  async despublicarBoletin(
    @Param('periodoId') periodoId: string,
    @Param('seccionId') seccionId: string,
  ) {
    const result = await this.despublicarBoletinUseCase.execute(periodoId, seccionId);
    if (!result.ok) throw result.error;
  }

  // ─── Listar publicaciones por sección ─────────────────────────────────────

  @Get('publicaciones')
  @Auth()
  @ApiOperation({ summary: 'Listar publicaciones de boletín por sección' })
  @ApiQuery({ name: 'seccionId', type: String })
  @ApiOkResponse({ schema: { type: 'array', items: { example: PUBLICACION_EXAMPLE } } })
  async listarPublicaciones(@Query('seccionId') seccionId: string) {
    if (!seccionId) throw new BadRequestException('El parámetro seccionId es requerido');
    const publicaciones = await this.listarPublicacionesUseCase.execute(seccionId);
    return publicaciones.map(p => ({
      id:            p.id,
      periodoId:     p.periodoId,
      seccionId:     p.seccionId,
      publicadoEn:   p.publicadoEn.toISOString(),
      publicadoPorId: p.publicadoPorId,
    }));
  }

  // ─── Apoderado ─────────────────────────────────────────────────────────────

  @Get('mio/:alumnoId')
  @Auth()
  @ApiOperation({ summary: 'Obtener boletín de mi hijo (solo periodos publicados)' })
  @ApiQuery({ name: 'año', type: Number, example: 2026 })
  @ApiOkResponse({ schema: { example: BOLETIN_EXAMPLE } })
  async obtenerBoletinApoderado(
    @Param('alumnoId') alumnoId: string,
    @Query('año') año: string,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.obtenerBoletinApoderadoUseCase.execute(
      req.user.sub,
      alumnoId,
      parseInt(año, 10),
    );
    if (!result.ok) throw result.error;
    return result.value;
  }
}
