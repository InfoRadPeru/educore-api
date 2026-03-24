import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { ALUMNO_REPOSITORY, type AlumnoRepository } from '../../domain/repositories/alumno.repository';
import { AlumnoResponseDto } from '../dtos/alumno-response.dto';
import { toDto } from './registrar-alumno.use-case';

@Injectable()
export class ObtenerAlumnoUseCase {
  constructor(
    @Inject(ALUMNO_REPOSITORY)
    private readonly alumnoRepository: AlumnoRepository,
  ) {}

  async execute(colegioId: string, alumnoId: string): Promise<Result<AlumnoResponseDto>> {
    const alumno = await this.alumnoRepository.buscarPorId(alumnoId);
    if (!alumno || alumno.colegioId !== colegioId) return fail(new NotFoundError('Alumno', alumnoId));
    return ok(toDto(alumno));
  }
}
