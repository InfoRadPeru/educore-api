import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  COLEGIO_ASIGNATURA_REPOSITORY,
  type ColegioAsignaturaRepository,
} from '../../domain/repositories/colegio-asignatura.repository';
import { ColegioAsignatura } from '../../domain/entities/asignatura.entity';

@Injectable()
export class DesactivarAsignaturaColegioUseCase {
  constructor(
    @Inject(COLEGIO_ASIGNATURA_REPOSITORY)
    private readonly repo: ColegioAsignaturaRepository,
  ) {}

  async execute(
    colegioId: string,
    id: string,
  ): Promise<Result<ColegioAsignatura, NotFoundError | ConflictError>> {
    const asignatura = await this.repo.buscarPorId(id);
    if (!asignatura) return fail(new NotFoundError('ColegioAsignatura', id));
    if (asignatura.colegioId !== colegioId) return fail(new NotFoundError('ColegioAsignatura', id));
    if (!asignatura.activo) return fail(new ConflictError('La asignatura ya está inactiva'));

    const actualizada = await this.repo.cambiarEstado(id, false);
    return ok(actualizada);
  }
}
