import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  ASIGNATURA_MAESTRA_REPOSITORY, type AsignaturaMaestraRepository,
  COLEGIO_ASIGNATURA_REPOSITORY, type ColegioAsignaturaRepository,
} from '../../domain/repositories/asignatura.repository';
import { ColegioAsignatura } from '../../domain/entities/asignatura.entity';

@Injectable()
export class ActivarAsignaturaColegioUseCase {
  constructor(
    @Inject(ASIGNATURA_MAESTRA_REPOSITORY)
    private readonly maestraRepo: AsignaturaMaestraRepository,
    @Inject(COLEGIO_ASIGNATURA_REPOSITORY)
    private readonly colegioRepo: ColegioAsignaturaRepository,
  ) {}

  async execute(
    colegioId: string,
    asignaturaMaestraId: string,
  ): Promise<Result<ColegioAsignatura, NotFoundError | ConflictError>> {
    const maestra = await this.maestraRepo.buscarPorId(asignaturaMaestraId);
    if (!maestra) return fail(new NotFoundError('AsignaturaMaestra', asignaturaMaestraId));
    if (!maestra.activo) return fail(new ConflictError('La asignatura maestra está inactiva'));

    const asignatura = await this.colegioRepo.activar(colegioId, asignaturaMaestraId);
    return ok(asignatura);
  }
}
