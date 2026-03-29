import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ValidationError } from '@shared/domain/result';
import {
  ASISTENCIA_REPOSITORY,
  type AsistenciaRepository,
} from '../../domain/repositories/asistencia.repository';
import { Asistencia } from '../../domain/entities/asistencia.entity';

@Injectable()
export class ListarAsistenciasAlumnoUseCase {
  constructor(
    @Inject(ASISTENCIA_REPOSITORY)
    private readonly repo: AsistenciaRepository,
  ) {}

  async execute(alumnoId: string, docenteAsignacionId: string): Promise<Result<Asistencia[], ValidationError>> {
    if (!docenteAsignacionId) return fail(new ValidationError('El parámetro docenteAsignacionId es requerido'));
    return ok(await this.repo.listarPorAlumnoYAsignacion(alumnoId, docenteAsignacionId));
  }
}
