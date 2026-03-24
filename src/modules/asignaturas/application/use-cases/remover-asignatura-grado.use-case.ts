import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import {
  GRADO_ASIGNATURA_REPOSITORY,
  type GradoAsignaturaRepository,
} from '../../domain/repositories/grado-asignatura.repository';

@Injectable()
export class RemoverAsignaturaGradoUseCase {
  constructor(
    @Inject(GRADO_ASIGNATURA_REPOSITORY)
    private readonly repo: GradoAsignaturaRepository,
  ) {}

  async execute(id: string): Promise<Result<void, NotFoundError>> {
    const gradoAsignatura = await this.repo.buscarPorId(id);
    if (!gradoAsignatura) return fail(new NotFoundError('GradoAsignatura', id));

    await this.repo.remover(id);
    return ok(undefined);
  }
}
