import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import {
  COLEGIO_ASIGNATURA_REPOSITORY,
  type ColegioAsignaturaRepository,
} from '../../domain/repositories/colegio-asignatura.repository';
import { ColegioAsignatura } from '../../domain/entities/asignatura.entity';

@Injectable()
export class ListarAsignaturasColegioUseCase {
  constructor(
    @Inject(COLEGIO_ASIGNATURA_REPOSITORY)
    private readonly repo: ColegioAsignaturaRepository,
  ) {}

  async execute(colegioId: string, soloActivas = false): Promise<Result<ColegioAsignatura[], never>> {
    return ok(await this.repo.listarPorColegio(colegioId, soloActivas));
  }
}
