import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import { PREMATRICULA_REPOSITORY, type PrematriculaRepository } from '../../domain/repositories/prematricula.repository';
import { ALUMNO_REPOSITORY, type AlumnoRepository } from '@modules/alumnos/domain/repositories/alumno.repository';
import { MATRICULA_REPOSITORY, type MatriculaRepository } from '@modules/matriculas/domain/repositories/matricula.repository';
import { CrearPrematriculaDto } from '../dtos/crear-prematricula.dto';
import { PrematriculaResponseDto } from '../dtos/prematricula-response.dto';
import { Prematricula } from '../../domain/entities/prematricula.entity';

@Injectable()
export class CrearPrematriculaUseCase {
  constructor(
    @Inject(PREMATRICULA_REPOSITORY)
    private readonly prematriculaRepository: PrematriculaRepository,
    @Inject(ALUMNO_REPOSITORY)
    private readonly alumnoRepository: AlumnoRepository,
    @Inject(MATRICULA_REPOSITORY)
    private readonly matriculaRepository: MatriculaRepository,
  ) {}

  async execute(colegioId: string, dto: CrearPrematriculaDto): Promise<Result<PrematriculaResponseDto>> {
    const alumno = await this.alumnoRepository.buscarPorId(dto.alumnoId);
    if (!alumno || alumno.colegioId !== colegioId) return fail(new NotFoundError('Alumno', dto.alumnoId));
    if (!alumno.estaActivo()) return fail(new ConflictError('Solo se puede pre-matricular un alumno en estado ACTIVO'));

    const prematriculas = await this.prematriculaRepository.listarPorAlumno(dto.alumnoId);
    const yaExiste = prematriculas.some(p => p.añoAcademico === dto.añoAcademico && p.esPendiente());
    if (yaExiste) return fail(new ConflictError(`El alumno ya tiene una prematrícula pendiente para el año ${dto.añoAcademico}`));

    const prematricula = await this.prematriculaRepository.crear({
      colegioId,
      alumnoId:       dto.alumnoId,
      colegioNivelId: dto.colegioNivelId,
      seccionId:      dto.seccionId,
      añoAcademico:   dto.añoAcademico,
      observaciones:  dto.observaciones,
    });

    return ok(toDto(prematricula));
  }
}

export function toDto(p: Prematricula): PrematriculaResponseDto {
  return {
    id:             p.id,
    colegioId:      p.colegioId,
    alumnoId:       p.alumnoId,
    colegioNivelId: p.colegioNivelId,
    seccionId:      p.seccionId,
    añoAcademico:   p.añoAcademico,
    estado:         p.estado,
    observaciones:  p.observaciones,
    matriculaId:    p.matriculaId,
    createdAt:      p.createdAt,
    updatedAt:      p.updatedAt,
  };
}
