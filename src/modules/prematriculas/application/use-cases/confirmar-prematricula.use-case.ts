import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import { PREMATRICULA_REPOSITORY, type PrematriculaRepository } from '../../domain/repositories/prematricula.repository';
import { ALUMNO_REPOSITORY, type AlumnoRepository } from '@modules/alumnos/domain/repositories/alumno.repository';
import { MATRICULA_REPOSITORY, type MatriculaRepository } from '@modules/matriculas/domain/repositories/matricula.repository';
import { ConfirmarPrematriculaDto } from '../dtos/confirmar-prematricula.dto';
import { PrematriculaResponseDto } from '../dtos/prematricula-response.dto';
import { toDto } from './crear-prematricula.use-case';

@Injectable()
export class ConfirmarPrematriculaUseCase {
  constructor(
    @Inject(PREMATRICULA_REPOSITORY)
    private readonly prematriculaRepository: PrematriculaRepository,
    @Inject(ALUMNO_REPOSITORY)
    private readonly alumnoRepository: AlumnoRepository,
    @Inject(MATRICULA_REPOSITORY)
    private readonly matriculaRepository: MatriculaRepository,
  ) {}

  async execute(colegioId: string, prematriculaId: string, dto: ConfirmarPrematriculaDto): Promise<Result<PrematriculaResponseDto>> {
    const prematricula = await this.prematriculaRepository.buscarPorId(prematriculaId);
    if (!prematricula || prematricula.colegioId !== colegioId) return fail(new NotFoundError('Prematricula', prematriculaId));
    if (!prematricula.esPendiente()) return fail(new ConflictError('Solo se pueden confirmar prematriculas en estado PENDIENTE'));

    const alumno = await this.alumnoRepository.buscarPorId(prematricula.alumnoId);
    if (!alumno || alumno.colegioId !== colegioId) return fail(new NotFoundError('Alumno', prematricula.alumnoId));
    if (!alumno.estaActivo()) return fail(new ConflictError('El alumno no está activo y no puede ser matriculado'));

    const tieneMatricula = await this.matriculaRepository.existeMatriculaActiva(prematricula.alumnoId, prematricula.añoAcademico);
    if (tieneMatricula) return fail(new ConflictError(`El alumno ya tiene una matrícula activa para el año ${prematricula.añoAcademico}`));

    // 1. Crear Matrícula
    const matricula = await this.matriculaRepository.crear({
      perfilAlumnoId: prematricula.alumnoId,
      seccionId:      dto.seccionId,
      añoAcademico:   prematricula.añoAcademico,
      estado:         'NUEVA_MATRICULA',
      observaciones:  dto.observaciones,
    });

    // 2. Enlazar prematricula con la matrícula creada
    prematricula.confirmar(matricula.id);
    const actualizada = await this.prematriculaRepository.actualizar(prematriculaId, {
      estado:      prematricula.estado,
      matriculaId: prematricula.matriculaId,
      seccionId:   dto.seccionId,
    });

    return ok(toDto(actualizada));
  }
}
