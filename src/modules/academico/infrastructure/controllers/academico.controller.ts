import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, Request,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { CrearPeriodoUseCase }         from '../../application/use-cases/crear-periodo.use-case';
import { ListarPeriodosUseCase }        from '../../application/use-cases/listar-periodos.use-case';
import { ActualizarPeriodoUseCase }     from '../../application/use-cases/actualizar-periodo.use-case';
import { CambiarEstadoPeriodoUseCase }  from '../../application/use-cases/cambiar-estado-periodo.use-case';
import { CrearCategoriaUseCase }        from '../../application/use-cases/crear-categoria.use-case';
import { ListarCategoriasUseCase }      from '../../application/use-cases/listar-categorias.use-case';
import { ActualizarCategoriaUseCase }   from '../../application/use-cases/actualizar-categoria.use-case';
import { EliminarCategoriaUseCase }     from '../../application/use-cases/eliminar-categoria.use-case';
import { CrearActividadUseCase }        from '../../application/use-cases/crear-actividad.use-case';
import { ListarActividadesUseCase }     from '../../application/use-cases/listar-actividades.use-case';
import { ActualizarActividadUseCase }   from '../../application/use-cases/actualizar-actividad.use-case';
import { EliminarActividadUseCase }     from '../../application/use-cases/eliminar-actividad.use-case';
import { RegistrarNotaUseCase }         from '../../application/use-cases/registrar-nota.use-case';
import { RegistrarNotasBulkUseCase }    from '../../application/use-cases/registrar-notas-bulk.use-case';
import { ListarNotasActividadUseCase }  from '../../application/use-cases/listar-notas-actividad.use-case';
import { ListarNotasAlumnoUseCase }     from '../../application/use-cases/listar-notas-alumno.use-case';
import { RegistrarAsistenciaClaseUseCase } from '../../application/use-cases/registrar-asistencia-clase.use-case';
import { CorregirAsistenciaUseCase }    from '../../application/use-cases/corregir-asistencia.use-case';
import { ListarAsistenciasClaseUseCase } from '../../application/use-cases/listar-asistencias-clase.use-case';
import { ListarAsistenciasAlumnoUseCase } from '../../application/use-cases/listar-asistencias-alumno.use-case';

import {
  CrearPeriodoDto, ActualizarPeriodoDto, CambiarEstadoDto,
  CrearCategoriaDto, ActualizarCategoriaDto,
  CrearActividadDto, ActualizarActividadDto,
  RegistrarNotaDto, RegistrarNotasBulkDto,
  RegistrarAsistenciaClaseDto, CorregirAsistenciaDto,
} from '../../application/dtos/academico.dto';
import { type EstadoAsistencia } from '../../domain/entities/asistencia.entity';

@ApiTags('Académico')
@Controller('academico')
export class AcademicoController {
  constructor(
    private readonly crearPeriodoUseCase:            CrearPeriodoUseCase,
    private readonly listarPeriodosUseCase:           ListarPeriodosUseCase,
    private readonly actualizarPeriodoUseCase:        ActualizarPeriodoUseCase,
    private readonly cambiarEstadoPeriodoUseCase:     CambiarEstadoPeriodoUseCase,
    private readonly crearCategoriaUseCase:           CrearCategoriaUseCase,
    private readonly listarCategoriasUseCase:         ListarCategoriasUseCase,
    private readonly actualizarCategoriaUseCase:      ActualizarCategoriaUseCase,
    private readonly eliminarCategoriaUseCase:        EliminarCategoriaUseCase,
    private readonly crearActividadUseCase:           CrearActividadUseCase,
    private readonly listarActividadesUseCase:        ListarActividadesUseCase,
    private readonly actualizarActividadUseCase:      ActualizarActividadUseCase,
    private readonly eliminarActividadUseCase:        EliminarActividadUseCase,
    private readonly registrarNotaUseCase:            RegistrarNotaUseCase,
    private readonly registrarNotasBulkUseCase:       RegistrarNotasBulkUseCase,
    private readonly listarNotasActividadUseCase:     ListarNotasActividadUseCase,
    private readonly listarNotasAlumnoUseCase:        ListarNotasAlumnoUseCase,
    private readonly registrarAsistenciaClaseUseCase: RegistrarAsistenciaClaseUseCase,
    private readonly corregirAsistenciaUseCase:       CorregirAsistenciaUseCase,
    private readonly listarAsistenciasClaseUseCase:   ListarAsistenciasClaseUseCase,
    private readonly listarAsistenciasAlumnoUseCase:  ListarAsistenciasAlumnoUseCase,
  ) {}

  // ─── Periodos ──────────────────────────────────────────────────────────────

  @Get('periodos')
  @Auth()
  @ApiOperation({ summary: 'Listar periodos de evaluación del colegio' })
  async listarPeriodos(
    @Request() req: { user: JwtPayload },
    @Query('año') año?: string,
  ) {
    const result = await this.listarPeriodosUseCase.execute(req.user.colegioId!, año ? +año : undefined);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('periodos')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear periodo de evaluación' })
  async crearPeriodo(
    @Request() req: { user: JwtPayload },
    @Body() dto: CrearPeriodoDto,
  ) {
    const result = await this.crearPeriodoUseCase.execute({
      colegioId:    req.user.colegioId!,
      añoAcademico: dto.añoAcademico,
      nombre:       dto.nombre,
      numero:       dto.numero,
      fechaInicio:  new Date(dto.fechaInicio),
      fechaFin:     new Date(dto.fechaFin),
    });
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('periodos/:id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar periodo de evaluación' })
  async actualizarPeriodo(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: ActualizarPeriodoDto,
  ) {
    const result = await this.actualizarPeriodoUseCase.execute(req.user.colegioId!, id, {
      nombre:      dto.nombre,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
      fechaFin:    dto.fechaFin    ? new Date(dto.fechaFin)    : undefined,
    });
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('periodos/:id/estado')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar o desactivar periodo' })
  async cambiarEstadoPeriodo(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: CambiarEstadoDto,
  ) {
    const result = await this.cambiarEstadoPeriodoUseCase.execute(req.user.colegioId!, id, dto.activo);
    if (!result.ok) throw result.error;
    return result.value;
  }

  // ─── Categorías ────────────────────────────────────────────────────────────

  @Get('asignaciones/:asignacionId/categorias')
  @Auth()
  @ApiOperation({ summary: 'Listar categorías de evaluación de una asignación docente' })
  async listarCategorias(@Param('asignacionId') asignacionId: string) {
    const result = await this.listarCategoriasUseCase.execute(asignacionId);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('categorias')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear categoría de evaluación (docente define peso)' })
  async crearCategoria(
    @Request() req: { user: JwtPayload },
    @Body() dto: CrearCategoriaDto,
  ) {
    const result = await this.crearCategoriaUseCase.execute(req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('categorias/:id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar categoría' })
  async actualizarCategoria(
    @Param('id') id: string,
    @Body() dto: ActualizarCategoriaDto,
  ) {
    const result = await this.actualizarCategoriaUseCase.execute(id, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Delete('categorias/:id')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar categoría (solo si no tiene actividades)' })
  async eliminarCategoria(@Param('id') id: string) {
    const result = await this.eliminarCategoriaUseCase.execute(id);
    if (!result.ok) throw result.error;
  }

  // ─── Actividades ───────────────────────────────────────────────────────────

  @Get('asignaciones/:asignacionId/actividades')
  @Auth()
  @ApiOperation({ summary: 'Listar actividades de una asignación docente' })
  async listarActividades(
    @Param('asignacionId') asignacionId: string,
    @Query('periodoId') periodoId?: string,
  ) {
    const result = await this.listarActividadesUseCase.execute(asignacionId, periodoId);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('actividades')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear actividad (tarea/examen/práctica)' })
  async crearActividad(@Body() dto: CrearActividadDto) {
    const result = await this.crearActividadUseCase.execute({
      docenteAsignacionId: dto.docenteAsignacionId,
      periodoId:           dto.periodoId,
      categoriaId:         dto.categoriaId,
      titulo:              dto.titulo,
      descripcion:         dto.descripcion,
      fechaLimite:         dto.fechaLimite ? new Date(dto.fechaLimite) : undefined,
      puntajeMaximo:       dto.puntajeMaximo,
      pesoEnCategoria:     dto.pesoEnCategoria,
    });
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('actividades/:id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar actividad' })
  async actualizarActividad(
    @Param('id') id: string,
    @Body() dto: ActualizarActividadDto,
  ) {
    const result = await this.actualizarActividadUseCase.execute(id, {
      titulo:          dto.titulo,
      descripcion:     dto.descripcion,
      fechaLimite:     dto.fechaLimite ? new Date(dto.fechaLimite) : dto.fechaLimite as null | undefined,
      puntajeMaximo:   dto.puntajeMaximo,
      pesoEnCategoria: dto.pesoEnCategoria,
    });
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Delete('actividades/:id')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar actividad (solo si no tiene notas)' })
  async eliminarActividad(@Param('id') id: string) {
    const result = await this.eliminarActividadUseCase.execute(id);
    if (!result.ok) throw result.error;
  }

  // ─── Notas ─────────────────────────────────────────────────────────────────

  @Get('actividades/:id/notas')
  @Auth()
  @ApiOperation({ summary: 'Listar notas de una actividad' })
  async listarNotasActividad(@Param('id') id: string) {
    const result = await this.listarNotasActividadUseCase.execute(id);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('actividades/:id/notas')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar o actualizar nota de un alumno' })
  async registrarNota(
    @Request() req: { user: JwtPayload },
    @Param('id') actividadId: string,
    @Body() dto: RegistrarNotaDto,
  ) {
    const result = await this.registrarNotaUseCase.execute(
      req.user.colegioId!,
      req.user.sub,
      { actividadId, alumnoId: dto.alumnoId, puntaje: dto.puntaje ?? null, observacion: dto.observacion, motivo: dto.motivo },
    );
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('actividades/:id/notas/bulk')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar notas de toda la clase en una actividad' })
  async registrarNotasBulk(
    @Request() req: { user: JwtPayload },
    @Param('id') actividadId: string,
    @Body() dto: RegistrarNotasBulkDto,
  ) {
    const result = await this.registrarNotasBulkUseCase.execute(
      req.user.colegioId!,
      req.user.sub,
      { actividadId, notas: dto.notas.map(n => ({ alumnoId: n.alumnoId, puntaje: n.puntaje ?? null, observacion: n.observacion })) },
    );
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get('alumnos/:alumnoId/notas')
  @Auth()
  @ApiOperation({ summary: 'Listar notas del alumno por asignación docente' })
  async listarNotasAlumno(
    @Param('alumnoId') alumnoId: string,
    @Query('docenteAsignacionId') docenteAsignacionId: string,
  ) {
    const result = await this.listarNotasAlumnoUseCase.execute(alumnoId, docenteAsignacionId);
    if (!result.ok) throw result.error;
    return result.value;
  }

  // ─── Asistencias ───────────────────────────────────────────────────────────

  @Post('asistencias/clase')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar asistencia de toda la clase' })
  async registrarAsistenciaClase(
    @Request() req: { user: JwtPayload },
    @Body() dto: RegistrarAsistenciaClaseDto,
  ) {
    const result = await this.registrarAsistenciaClaseUseCase.execute({
      docenteAsignacionId: dto.docenteAsignacionId,
      fecha:               new Date(dto.fecha),
      registros:           dto.registros.map(r => ({
        alumnoId:        r.alumnoId,
        estado:          r.estado as EstadoAsistencia,
        observacion:     r.observacion,
        registradoPorId: req.user.sub,
      })),
    });
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('asistencias/:docenteAsignacionId/:alumnoId/:fecha')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Corregir asistencia de un alumno' })
  async corregirAsistencia(
    @Request() req: { user: JwtPayload },
    @Param('docenteAsignacionId') docenteAsignacionId: string,
    @Param('alumnoId') alumnoId: string,
    @Param('fecha') fecha: string,
    @Body() dto: CorregirAsistenciaDto,
  ) {
    const result = await this.corregirAsistenciaUseCase.execute({
      docenteAsignacionId,
      alumnoId,
      fecha:           new Date(fecha),
      estado:          dto.estado as EstadoAsistencia,
      observacion:     dto.observacion,
      registradoPorId: req.user.sub,
    });
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get('asistencias/clase')
  @Auth()
  @ApiOperation({ summary: 'Listar asistencias de una clase en una fecha' })
  async listarAsistenciasClase(
    @Query('docenteAsignacionId') docenteAsignacionId: string,
    @Query('fecha') fecha: string,
  ) {
    const result = await this.listarAsistenciasClaseUseCase.execute(docenteAsignacionId, new Date(fecha));
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get('asistencias/alumno/:alumnoId')
  @Auth()
  @ApiOperation({ summary: 'Historial de asistencia de un alumno por asignación' })
  async listarAsistenciasAlumno(
    @Param('alumnoId') alumnoId: string,
    @Query('docenteAsignacionId') docenteAsignacionId: string,
  ) {
    const result = await this.listarAsistenciasAlumnoUseCase.execute(alumnoId, docenteAsignacionId);
    if (!result.ok) throw result.error;
    return result.value;
  }
}
