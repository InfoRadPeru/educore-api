import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import {
  CATEGORIA_EVALUACION_REPOSITORY,
  type CategoriaEvaluacionRepository,
} from '../../domain/repositories/categoria-evaluacion.repository';
import { CategoriaEvaluacion } from '../../domain/entities/categoria-evaluacion.entity';

@Injectable()
export class ListarCategoriasUseCase {
  constructor(
    @Inject(CATEGORIA_EVALUACION_REPOSITORY)
    private readonly repo: CategoriaEvaluacionRepository,
  ) {}

  async execute(docenteAsignacionId: string, soloActivas = false): Promise<Result<CategoriaEvaluacion[], never>> {
    return ok(await this.repo.listarPorAsignacion(docenteAsignacionId, soloActivas));
  }
}
