import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { ALUMNO_REPOSITORY, type AlumnoRepository } from '@modules/alumnos/domain/repositories/alumno.repository';
import { MATRICULA_REPOSITORY, type MatriculaRepository } from '../../domain/repositories/matricula.repository';
import { CambiarEstadoMatriculaDto } from '../dtos/cambiar-estado-matricula.dto';
import { MatriculaResponseDto } from '../dtos/matricula-response.dto';
import { toDto } from './matricular-alumno.use-case';

@Injectable()
export class CambiarEstadoMatriculaUseCase {
  constructor(
    @Inject(ALUMNO_REPOSITORY)
    private readonly alumnoRepository: AlumnoRepository,
    @Inject(MATRICULA_REPOSITORY)
    private readonly matriculaRepository: MatriculaRepository,
  ) {}

  async execute(colegioId: string, matriculaId: string, dto: CambiarEstadoMatriculaDto): Promise<Result<MatriculaResponseDto>> {
    const matricula = await this.matriculaRepository.buscarPorId(matriculaId);
    if (!matricula) return fail(new NotFoundError('Matricula', matriculaId));

    const alumno = await this.alumnoRepository.buscarPorId(matricula.perfilAlumnoId);
    if (!alumno || alumno.colegioId !== colegioId) return fail(new NotFoundError('Matricula', matriculaId));

    const actualizada = await this.matriculaRepository.cambiarEstado(matriculaId, dto.estado, dto.observaciones);
    return ok(toDto(actualizada));
  }
}
