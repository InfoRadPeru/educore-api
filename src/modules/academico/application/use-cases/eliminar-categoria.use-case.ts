import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  CATEGORIA_EVALUACION_REPOSITORY,
  type CategoriaEvaluacionRepository,
} from '../../domain/repositories/categoria-evaluacion.repository';

@Injectable()
export class EliminarCategoriaUseCase {
  constructor(
    @Inject(CATEGORIA_EVALUACION_REPOSITORY)
    private readonly repo: CategoriaEvaluacionRepository,
  ) {}

  async execute(id: string): Promise<Result<void, NotFoundError | ConflictError>> {
    const categoria = await this.repo.buscarPorId(id);
    if (!categoria) return fail(new NotFoundError('CategoriaEvaluacion', id));

    const tieneActividades = await this.repo.tieneActividades(id);
    if (tieneActividades)
      return fail(new ConflictError('No se puede eliminar la categoría porque tiene actividades asociadas'));

    await this.repo.desactivar(id);
    return ok(undefined);
  }
}
