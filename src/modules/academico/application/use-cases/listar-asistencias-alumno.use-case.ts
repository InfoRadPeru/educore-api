import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
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

  async execute(alumnoId: string, docenteAsignacionId: string): Promise<Result<Asistencia[], never>> {
    return ok(await this.repo.listarPorAlumnoYAsignacion(alumnoId, docenteAsignacionId));
  }
}
