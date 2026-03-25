import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import {
  HORARIO_REPOSITORY,
  type HorarioRepository,
} from '../../domain/repositories/horario.repository';

@Injectable()
export class EliminarBloqueUseCase {
  constructor(
    @Inject(HORARIO_REPOSITORY)
    private readonly repo: HorarioRepository,
  ) {}

  async execute(bloqueId: string): Promise<Result<void, NotFoundError>> {
    const bloque = await this.repo.buscarBloque(bloqueId);
    if (!bloque) return fail(new NotFoundError('HorarioBloque', bloqueId));
    await this.repo.eliminarBloque(bloqueId);
    return ok(undefined);
  }
}
