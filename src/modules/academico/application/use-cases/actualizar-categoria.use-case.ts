import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  CATEGORIA_EVALUACION_REPOSITORY,
  type CategoriaEvaluacionRepository,
  type ActualizarCategoriaProps,
} from '../../domain/repositories/categoria-evaluacion.repository';
import { CategoriaEvaluacion } from '../../domain/entities/categoria-evaluacion.entity';

@Injectable()
export class ActualizarCategoriaUseCase {
  constructor(
    @Inject(CATEGORIA_EVALUACION_REPOSITORY)
    private readonly repo: CategoriaEvaluacionRepository,
  ) {}

  async execute(
    id: string,
    props: ActualizarCategoriaProps,
  ): Promise<Result<CategoriaEvaluacion, NotFoundError | ConflictError>> {
    const categoria = await this.repo.buscarPorId(id);
    if (!categoria) return fail(new NotFoundError('CategoriaEvaluacion', id));

    if (props.nombre && props.nombre !== categoria.nombre) {
      const conflicto = await this.repo.buscarPorNombreEnAsignacion(categoria.docenteAsignacionId, props.nombre);
      if (conflicto) return fail(new ConflictError(`Ya existe la categoría "${props.nombre}" en esta asignación`));
    }

    if (props.peso !== undefined && props.peso !== categoria.peso) {
      const sumaSinEsta = await this.repo.sumaPesosPorAsignacion(categoria.docenteAsignacionId, id);
      if (sumaSinEsta + props.peso > 100)
        return fail(new ConflictError(`La suma de pesos excedería 100% (otras categorías: ${sumaSinEsta}%)`));
    }

    const actualizada = await this.repo.actualizar(id, props);
    return ok(actualizada);
  }
}
