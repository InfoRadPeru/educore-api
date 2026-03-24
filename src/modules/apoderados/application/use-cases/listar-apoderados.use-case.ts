import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { APODERADO_REPOSITORY, type ApoderadoRepository } from '../../domain/repositories/apoderado.repository';
import { Apoderado } from '../../domain/entities/apoderado.entity';

@Injectable()
export class ListarApoderadosUseCase {
  constructor(
    @Inject(APODERADO_REPOSITORY)
    private readonly apoderadoRepo: ApoderadoRepository,
  ) {}

  async execute(colegioId: string): Promise<Result<Apoderado[], never>> {
    const apoderados = await this.apoderadoRepo.listarPorColegio(colegioId);
    return ok(apoderados);
  }
}
