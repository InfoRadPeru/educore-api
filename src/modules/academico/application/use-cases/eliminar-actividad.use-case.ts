import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  ACTIVIDAD_REPOSITORY,
  type ActividadRepository,
} from '../../domain/repositories/actividad.repository';

@Injectable()
export class EliminarActividadUseCase {
  constructor(
    @Inject(ACTIVIDAD_REPOSITORY)
    private readonly repo: ActividadRepository,
  ) {}

  async execute(id: string): Promise<Result<void, NotFoundError | ConflictError>> {
    const actividad = await this.repo.buscarPorId(id);
    if (!actividad) return fail(new NotFoundError('Actividad', id));

    const tieneNotas = await this.repo.tieneNotas(id);
    if (tieneNotas)
      return fail(new ConflictError('No se puede eliminar la actividad porque ya tiene notas registradas'));

    await this.repo.desactivar(id);
    return ok(undefined);
  }
}
