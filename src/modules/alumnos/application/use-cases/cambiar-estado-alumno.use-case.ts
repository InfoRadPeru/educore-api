import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import { ALUMNO_REPOSITORY, type AlumnoRepository } from '../../domain/repositories/alumno.repository';
import { CambiarEstadoAlumnoDto } from '../dtos/cambiar-estado-alumno.dto';
import { AlumnoResponseDto } from '../dtos/alumno-response.dto';
import { toDto } from './registrar-alumno.use-case';

@Injectable()
export class CambiarEstadoAlumnoUseCase {
  constructor(
    @Inject(ALUMNO_REPOSITORY)
    private readonly alumnoRepository: AlumnoRepository,
  ) {}

  async execute(colegioId: string, alumnoId: string, dto: CambiarEstadoAlumnoDto): Promise<Result<AlumnoResponseDto>> {
    const alumno = await this.alumnoRepository.buscarPorId(alumnoId);
    if (!alumno || alumno.colegioId !== colegioId) return fail(new NotFoundError('Alumno', alumnoId));

    if (alumno.estado === dto.estado) {
      return fail(new ConflictError(`El alumno ya se encuentra en estado '${dto.estado}'`));
    }

    const actualizado = await this.alumnoRepository.cambiarEstado(alumnoId, dto.estado);
    return ok(toDto(actualizado));
  }
}
