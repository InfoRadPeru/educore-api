import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import {
  GRADO_ASIGNATURA_REPOSITORY,
  type GradoAsignaturaRepository,
} from '../../domain/repositories/grado-asignatura.repository';
import { GradoAsignatura } from '../../domain/entities/grado-asignatura.entity';

@Injectable()
export class ListarAsignaturasGradoUseCase {
  constructor(
    @Inject(GRADO_ASIGNATURA_REPOSITORY)
    private readonly repo: GradoAsignaturaRepository,
  ) {}

  async execute(colegioGradoId: string): Promise<Result<GradoAsignatura[], never>> {
    return ok(await this.repo.listarPorGrado(colegioGradoId));
  }
}
