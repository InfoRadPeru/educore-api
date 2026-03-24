import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import {
  GRADO_ASIGNATURA_REPOSITORY,
  type GradoAsignaturaRepository,
} from '../../domain/repositories/grado-asignatura.repository';
import { GradoAsignatura } from '../../domain/entities/grado-asignatura.entity';

@Injectable()
export class ActualizarHorasGradoUseCase {
  constructor(
    @Inject(GRADO_ASIGNATURA_REPOSITORY)
    private readonly repo: GradoAsignaturaRepository,
  ) {}

  async execute(
    id: string,
    horasSemanales: number | null,
  ): Promise<Result<GradoAsignatura, NotFoundError>> {
    const gradoAsignatura = await this.repo.buscarPorId(id);
    if (!gradoAsignatura) return fail(new NotFoundError('GradoAsignatura', id));

    const actualizada = await this.repo.actualizar(id, horasSemanales);
    return ok(actualizada);
  }
}
