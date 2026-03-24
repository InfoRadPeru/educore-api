import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { DOCENTE_REPOSITORY, type DocenteRepository } from '../../domain/repositories/docente.repository';
import { Docente, type EstadoDocente } from '../../domain/entities/docente.entity';

@Injectable()
export class ListarDocentesUseCase {
  constructor(
    @Inject(DOCENTE_REPOSITORY)
    private readonly docenteRepo: DocenteRepository,
  ) {}

  async execute(colegioId: string, estado?: EstadoDocente): Promise<Result<Docente[], never>> {
    return ok(await this.docenteRepo.listarPorColegio(colegioId, estado));
  }
}
