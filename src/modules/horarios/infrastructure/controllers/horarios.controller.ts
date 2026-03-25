import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, Request,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { CrearFranjaUseCase }              from '../../application/use-cases/crear-franja.use-case';
import { ListarFranjasUseCase }            from '../../application/use-cases/listar-franjas.use-case';
import { ActualizarFranjaUseCase }         from '../../application/use-cases/actualizar-franja.use-case';
import { EliminarFranjaUseCase }           from '../../application/use-cases/eliminar-franja.use-case';
import { CrearHorarioSeccionUseCase }      from '../../application/use-cases/crear-horario-seccion.use-case';
import { ObtenerHorarioSeccionUseCase }    from '../../application/use-cases/obtener-horario-seccion.use-case';
import { ListarHorariosColegioUseCase }    from '../../application/use-cases/listar-horarios-colegio.use-case';
import { PublicarHorarioUseCase }          from '../../application/use-cases/publicar-horario.use-case';
import { AgregarBloqueUseCase }            from '../../application/use-cases/agregar-bloque.use-case';
import { ActualizarBloqueUseCase }         from '../../application/use-cases/actualizar-bloque.use-case';
import { EliminarBloqueUseCase }           from '../../application/use-cases/eliminar-bloque.use-case';
import { GenerarHorarioAutoUseCase }       from '../../application/use-cases/generar-horario-auto.use-case';
import { GenerarHorarioColegioUseCase }    from '../../application/use-cases/generar-horario-colegio.use-case';
import { ObtenerHorarioDocenteUseCase }    from '../../application/use-cases/obtener-horario-docente.use-case';
import {
  CrearFranjaDto, ActualizarFranjaDto,
  CrearHorarioDto, GenerarHorarioDto, GenerarHorarioColegioDto,
  AgregarBloqueDto, ActualizarBloqueDto,
} from '../../application/dtos/horario.dto';
import { DiaSemana } from '../../domain/entities/horario-bloque.entity';

@ApiTags('Horarios')
@Controller('horarios')
export class HorariosController {
  constructor(
    private readonly crearFranjaUseCase:           CrearFranjaUseCase,
    private readonly listarFranjasUseCase:          ListarFranjasUseCase,
    private readonly actualizarFranjaUseCase:       ActualizarFranjaUseCase,
    private readonly eliminarFranjaUseCase:          EliminarFranjaUseCase,
    private readonly crearHorarioSeccionUseCase:    CrearHorarioSeccionUseCase,
    private readonly obtenerHorarioSeccionUseCase:  ObtenerHorarioSeccionUseCase,
    private readonly listarHorariosColegioUseCase:  ListarHorariosColegioUseCase,
    private readonly publicarHorarioUseCase:        PublicarHorarioUseCase,
    private readonly agregarBloqueUseCase:          AgregarBloqueUseCase,
    private readonly actualizarBloqueUseCase:       ActualizarBloqueUseCase,
    private readonly eliminarBloqueUseCase:          EliminarBloqueUseCase,
    private readonly generarHorarioAutoUseCase:     GenerarHorarioAutoUseCase,
    private readonly generarHorarioColegioUseCase:  GenerarHorarioColegioUseCase,
    private readonly obtenerHorarioDocenteUseCase:  ObtenerHorarioDocenteUseCase,
  ) {}

  // ─── Franjas Horarias ─────────────────────────────────────────────────────

  @Get('franjas')
  @Auth()
  @ApiOperation({ summary: 'Listar franjas horarias del colegio' })
  async listarFranjas(@Request() req: { user: JwtPayload }) {
    const franjas = await this.listarFranjasUseCase.execute(req.user.colegioId!);
    return franjas.map(f => ({
      id: f.id, nombre: f.nombre, horaInicio: f.horaInicio,
      horaFin: f.horaFin, orden: f.orden, activo: f.activo,
    }));
  }

  @Post('franjas')
  @Auth()
  @ApiOperation({ summary: 'Crear franja horaria' })
  async crearFranja(
    @Body() dto: CrearFranjaDto,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.crearFranjaUseCase.execute({ ...dto, colegioId: req.user.colegioId! });
    if (!result.ok) throw result.error;
    const f = result.value;
    return { id: f.id, nombre: f.nombre, horaInicio: f.horaInicio, horaFin: f.horaFin, orden: f.orden, activo: f.activo };
  }

  @Patch('franjas/:id')
  @Auth()
  @ApiOperation({ summary: 'Actualizar franja horaria' })
  async actualizarFranja(
    @Param('id') id: string,
    @Body() dto: ActualizarFranjaDto,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.actualizarFranjaUseCase.execute(id, req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    const f = result.value;
    return { id: f.id, nombre: f.nombre, horaInicio: f.horaInicio, horaFin: f.horaFin, orden: f.orden, activo: f.activo };
  }

  @Delete('franjas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  @ApiOperation({ summary: 'Eliminar franja horaria (si no tiene bloques)' })
  async eliminarFranja(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.eliminarFranjaUseCase.execute(id, req.user.colegioId!);
    if (!result.ok) throw result.error;
  }

  // ─── Vistas estáticas (antes de /:id dinámico) ────────────────────────────

  @Get('colegio')
  @Auth()
  @ApiOperation({ summary: 'Listar todos los horarios del colegio por año' })
  @ApiQuery({ name: 'año', type: Number, example: 2026 })
  async listarHorariosColegio(
    @Request() req: { user: JwtPayload },
    @Query('año') año: string,
  ) {
    const horarios = await this.listarHorariosColegioUseCase.execute(
      req.user.colegioId!,
      parseInt(año, 10),
    );
    return horarios.map(h => ({
      id: h.id, seccionId: h.seccionId, añoAcademico: h.añoAcademico,
      estado: h.estado, generadoAuto: h.generadoAuto,
    }));
  }

  @Post('generar-colegio')
  @Auth()
  @ApiOperation({ summary: 'Auto-generar horarios para todas las secciones del colegio' })
  async generarHorarioColegio(
    @Body() dto: GenerarHorarioColegioDto,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.generarHorarioColegioUseCase.execute(
      req.user.colegioId!,
      dto.añoAcademico,
      dto.sobreescribir ?? false,
    );
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get('docente/:docenteId')
  @Auth()
  @ApiOperation({ summary: 'Ver horario semanal publicado de un docente' })
  @ApiQuery({ name: 'año', type: Number, example: 2026 })
  async obtenerHorarioDocente(
    @Param('docenteId') docenteId: string,
    @Query('año') año: string,
  ) {
    const result = await this.obtenerHorarioDocenteUseCase.execute(
      docenteId,
      parseInt(año, 10),
    );
    if (!result.ok) throw result.error;
    return result.value;
  }

  // ─── Horario por sección ──────────────────────────────────────────────────

  @Get('seccion/:seccionId')
  @Auth()
  @ApiOperation({ summary: 'Obtener horario de una sección con sus bloques' })
  @ApiQuery({ name: 'año', type: Number, example: 2026 })
  async obtenerHorarioSeccion(
    @Param('seccionId') seccionId: string,
    @Query('año') año: string,
  ) {
    const result = await this.obtenerHorarioSeccionUseCase.execute(
      seccionId,
      parseInt(año, 10),
    );
    if (!result.ok) throw result.error;
    const { horario, bloques } = result.value;
    return {
      id:           horario.id,
      seccionId:    horario.seccionId,
      añoAcademico: horario.añoAcademico,
      estado:       horario.estado,
      generadoAuto: horario.generadoAuto,
      bloques: bloques.map(b => ({
        id:               b.id,
        dia:              b.diaSemana,
        franjaId:         b.franjaHorariaId,
        franjaNombre:     b.franjaNombre,
        horaInicio:       b.franjaHoraInicio,
        horaFin:          b.franjaHoraFin,
        asignatura:       b.asignaturaNombre,
        docente:          b.docenteNombre,
        docenteAsignId:   b.docenteAsignacionId,
        aula:             b.aula,
      })),
    };
  }

  @Post('seccion/:seccionId')
  @Auth()
  @ApiOperation({ summary: 'Crear horario vacío (BORRADOR) para una sección' })
  async crearHorarioSeccion(
    @Param('seccionId') seccionId: string,
    @Body() dto: CrearHorarioDto,
  ) {
    const result = await this.crearHorarioSeccionUseCase.execute(seccionId, dto.añoAcademico);
    if (!result.ok) throw result.error;
    const h = result.value;
    return { id: h.id, seccionId: h.seccionId, añoAcademico: h.añoAcademico, estado: h.estado };
  }

  @Post('seccion/:seccionId/generar')
  @Auth()
  @ApiOperation({ summary: 'Auto-generar horario para una sección' })
  async generarHorarioSeccion(
    @Param('seccionId') seccionId: string,
    @Body() dto: GenerarHorarioDto,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.generarHorarioAutoUseCase.execute(
      seccionId,
      dto.añoAcademico,
      req.user.colegioId!,
      dto.sobreescribir ?? false,
    );
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('seccion/:seccionId/publicar')
  @Auth()
  @ApiOperation({ summary: 'Publicar horario de una sección' })
  async publicarHorario(
    @Param('seccionId') seccionId: string,
    @Query('año') año: string,
  ) {
    const result = await this.publicarHorarioUseCase.execute(seccionId, parseInt(año, 10));
    if (!result.ok) throw result.error;
    const h = result.value;
    return { id: h.id, estado: h.estado };
  }

  // ─── Bloques individuales ─────────────────────────────────────────────────

  @Post('seccion/:seccionId/bloques')
  @Auth()
  @ApiOperation({ summary: 'Agregar bloque manual al horario de una sección' })
  async agregarBloque(
    @Param('seccionId') seccionId: string,
    @Body() dto: AgregarBloqueDto,
    @Query('año') año: string,
  ) {
    const result = await this.agregarBloqueUseCase.execute(
      seccionId,
      parseInt(año, 10),
      dto.docenteAsignacionId,
      dto.franjaHorariaId,
      dto.diaSemana as DiaSemana,
      dto.aula,
    );
    if (!result.ok) throw result.error;
    const b = result.value;
    return { id: b.id, dia: b.diaSemana, franjaId: b.franjaHorariaId, docenteAsignId: b.docenteAsignacionId, aula: b.aula };
  }

  @Patch('bloques/:bloqueId')
  @Auth()
  @ApiOperation({ summary: 'Actualizar bloque del horario' })
  async actualizarBloque(
    @Param('bloqueId') bloqueId: string,
    @Body() dto: ActualizarBloqueDto,
  ) {
    const result = await this.actualizarBloqueUseCase.execute(bloqueId, {
      docenteAsignacionId: dto.docenteAsignacionId,
      franjaHorariaId:     dto.franjaHorariaId,
      diaSemana:           dto.diaSemana as DiaSemana | undefined,
      aula:                dto.aula,
    });
    if (!result.ok) throw result.error;
    const b = result.value;
    return { id: b.id, dia: b.diaSemana, franjaId: b.franjaHorariaId, docenteAsignId: b.docenteAsignacionId, aula: b.aula };
  }

  @Delete('bloques/:bloqueId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  @ApiOperation({ summary: 'Eliminar bloque del horario' })
  async eliminarBloque(@Param('bloqueId') bloqueId: string) {
    const result = await this.eliminarBloqueUseCase.execute(bloqueId);
    if (!result.ok) throw result.error;
  }
}
