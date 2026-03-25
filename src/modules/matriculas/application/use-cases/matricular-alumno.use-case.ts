import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import { ALUMNO_REPOSITORY, type AlumnoRepository } from '@modules/alumnos/domain/repositories/alumno.repository';
import { MATRICULA_REPOSITORY, type MatriculaRepository } from '../../domain/repositories/matricula.repository';
import { MatricularAlumnoDto } from '../dtos/matricular-alumno.dto';
import { MatriculaResponseDto } from '../dtos/matricula-response.dto';
import { Matricula } from '../../domain/entities/matricula.entity';

@Injectable()
export class MatricularAlumnoUseCase {
  constructor(
    @Inject(ALUMNO_REPOSITORY)
    private readonly alumnoRepository: AlumnoRepository,
    @Inject(MATRICULA_REPOSITORY)
    private readonly matriculaRepository: MatriculaRepository,
  ) {}

  async execute(colegioId: string, dto: MatricularAlumnoDto): Promise<Result<MatriculaResponseDto>> {
    const alumno = await this.alumnoRepository.buscarPorId(dto.alumnoId);
    if (!alumno || alumno.colegioId !== colegioId) return fail(new NotFoundError('Alumno', dto.alumnoId));
    if (!alumno.estaActivo()) return fail(new ConflictError('Solo se pueden matricular alumnos en estado ACTIVO'));

    const yaMatriculado = await this.matriculaRepository.existeMatriculaActiva(dto.alumnoId, dto.añoAcademico);
    if (yaMatriculado) return fail(new ConflictError(`El alumno ya tiene una matrícula activa para el año ${dto.añoAcademico}`));

    const matricula = await this.matriculaRepository.crear({
      perfilAlumnoId: dto.alumnoId,
      seccionId:      dto.seccionId,
      añoAcademico:   dto.añoAcademico,
      estado:         'NUEVA_MATRICULA',
      observaciones:  dto.observaciones,
    });

    return ok(toDto(matricula));
  }
}

export function toDto(m: Matricula): MatriculaResponseDto {
  return {
    id:             m.id,
    perfilAlumnoId: m.perfilAlumnoId,
    seccionId:      m.seccionId,
    añoAcademico:   m.añoAcademico,
    estado:         m.estado,
    observaciones:  m.observaciones,
    createdAt:      m.createdAt,
    updatedAt:      m.updatedAt,
  };
}
