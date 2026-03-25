import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import {
  ASISTENCIA_REPOSITORY,
  type AsistenciaRepository,
} from '../../domain/repositories/asistencia.repository';
import { Asistencia } from '../../domain/entities/asistencia.entity';

@Injectable()
export class ListarAsistenciasClaseUseCase {
  constructor(
    @Inject(ASISTENCIA_REPOSITORY)
    private readonly repo: AsistenciaRepository,
  ) {}

  async execute(docenteAsignacionId: string, fecha: Date): Promise<Result<Asistencia[], never>> {
    return ok(await this.repo.listarPorAsignacionYFecha(docenteAsignacionId, fecha));
  }
}
