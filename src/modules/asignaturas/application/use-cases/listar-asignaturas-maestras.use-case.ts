import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import {
  ASIGNATURA_MAESTRA_REPOSITORY,
  type AsignaturaMaestraRepository,
} from '../../domain/repositories/asignatura-maestra.repository';
import { AsignaturaMaestra } from '../../domain/entities/asignatura.entity';

@Injectable()
export class ListarAsignaturasMaestrasUseCase {
  constructor(
    @Inject(ASIGNATURA_MAESTRA_REPOSITORY)
    private readonly repo: AsignaturaMaestraRepository,
  ) {}

  async execute(soloActivas = false): Promise<Result<AsignaturaMaestra[], never>> {
    return ok(await this.repo.listar(soloActivas));
  }
}
