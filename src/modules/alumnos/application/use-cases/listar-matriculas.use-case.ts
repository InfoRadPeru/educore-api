import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { ALUMNO_REPOSITORY, type AlumnoRepository } from '../../domain/repositories/alumno.repository';
import { MATRICULA_REPOSITORY, type MatriculaRepository } from '../../domain/repositories/matricula.repository';
import { MatriculaResponseDto } from '../dtos/matricula-response.dto';
import { toDto } from './matricular-alumno.use-case';

@Injectable()
export class ListarMatriculasUseCase {
  constructor(
    @Inject(ALUMNO_REPOSITORY)
    private readonly alumnoRepository: AlumnoRepository,
    @Inject(MATRICULA_REPOSITORY)
    private readonly matriculaRepository: MatriculaRepository,
  ) {}

  async execute(colegioId: string, alumnoId: string): Promise<Result<MatriculaResponseDto[]>> {
    const alumno = await this.alumnoRepository.buscarPorId(alumnoId);
    if (!alumno || alumno.colegioId !== colegioId) return fail(new NotFoundError('Alumno', alumnoId));

    const matriculas = await this.matriculaRepository.listarPorAlumno(alumnoId);
    return ok(matriculas.map(toDto));
  }
}
