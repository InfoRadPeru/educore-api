import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { ALUMNO_REPOSITORY, type AlumnoRepository } from '../../domain/repositories/alumno.repository';
import { AlumnoResponseDto } from '../dtos/alumno-response.dto';
import { EstadoAlumno } from '../../domain/entities/alumno.entity';
import { toDto } from './registrar-alumno.use-case';

@Injectable()
export class ListarAlumnosUseCase {
  constructor(
    @Inject(ALUMNO_REPOSITORY)
    private readonly alumnoRepository: AlumnoRepository,
  ) {}

  async execute(colegioId: string, estado?: EstadoAlumno): Promise<Result<AlumnoResponseDto[]>> {
    const alumnos = await this.alumnoRepository.listarPorColegio(colegioId, estado);
    return ok(alumnos.map(toDto));
  }
}
