import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import {
  ACTIVIDAD_REPOSITORY,
  type ActividadRepository,
  type ActualizarActividadProps,
} from '../../domain/repositories/actividad.repository';
import { Actividad } from '../../domain/entities/actividad.entity';

@Injectable()
export class ActualizarActividadUseCase {
  constructor(
    @Inject(ACTIVIDAD_REPOSITORY)
    private readonly repo: ActividadRepository,
  ) {}

  async execute(id: string, props: ActualizarActividadProps): Promise<Result<Actividad, NotFoundError>> {
    const actividad = await this.repo.buscarPorId(id);
    if (!actividad) return fail(new NotFoundError('Actividad', id));

    const actualizada = await this.repo.actualizar(id, props);
    return ok(actualizada);
  }
}
