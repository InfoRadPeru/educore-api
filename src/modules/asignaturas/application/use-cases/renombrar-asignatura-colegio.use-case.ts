import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import {
  COLEGIO_ASIGNATURA_REPOSITORY,
  type ColegioAsignaturaRepository,
} from '../../domain/repositories/colegio-asignatura.repository';
import { ColegioAsignatura } from '../../domain/entities/asignatura.entity';

@Injectable()
export class RenombrarAsignaturaColegioUseCase {
  constructor(
    @Inject(COLEGIO_ASIGNATURA_REPOSITORY)
    private readonly repo: ColegioAsignaturaRepository,
  ) {}

  async execute(
    colegioId: string,
    id: string,
    nombre: string | null,
  ): Promise<Result<ColegioAsignatura, NotFoundError>> {
    const asignatura = await this.repo.buscarPorId(id);
    if (!asignatura) return fail(new NotFoundError('ColegioAsignatura', id));
    if (asignatura.colegioId !== colegioId) return fail(new NotFoundError('ColegioAsignatura', id));

    const actualizada = await this.repo.renombrar(id, nombre);
    return ok(actualizada);
  }
}
