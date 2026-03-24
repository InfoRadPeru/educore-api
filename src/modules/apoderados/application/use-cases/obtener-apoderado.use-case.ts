import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { APODERADO_REPOSITORY, type ApoderadoRepository } from '../../domain/repositories/apoderado.repository';
import { Apoderado } from '../../domain/entities/apoderado.entity';

@Injectable()
export class ObtenerApoderadoUseCase {
  constructor(
    @Inject(APODERADO_REPOSITORY)
    private readonly apoderadoRepo: ApoderadoRepository,
  ) {}

  async execute(id: string): Promise<Result<Apoderado, NotFoundError>> {
    const apoderado = await this.apoderadoRepo.buscarPorId(id);
    if (!apoderado) return fail(new NotFoundError('Apoderado', id));
    return ok(apoderado);
  }
}
