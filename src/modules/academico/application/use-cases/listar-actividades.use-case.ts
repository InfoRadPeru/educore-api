import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ValidationError } from '@shared/domain/result';
import {
  ACTIVIDAD_REPOSITORY,
  type ActividadRepository,
} from '../../domain/repositories/actividad.repository';
import { Actividad } from '../../domain/entities/actividad.entity';

@Injectable()
export class ListarActividadesUseCase {
  constructor(
    @Inject(ACTIVIDAD_REPOSITORY)
    private readonly repo: ActividadRepository,
  ) {}

  async execute(docenteAsignacionId: string, periodoId?: string): Promise<Result<Actividad[], ValidationError>> {
    if (!docenteAsignacionId) return fail(new ValidationError('El parámetro docenteAsignacionId es requerido'));
    const actividades = periodoId
      ? await this.repo.listarPorAsignacionYPeriodo(docenteAsignacionId, periodoId)
      : await this.repo.listarPorAsignacion(docenteAsignacionId);
    return ok(actividades);
  }
}
