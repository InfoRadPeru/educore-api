import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { TESORERIA_REPOSITORY, type TesoreriaRepository } from '../../domain/repositories/tesoreria.repository';

@Injectable()
export class EliminarTarifaUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}

  async execute(id: string): Promise<Result<void, NotFoundError>> {
    await this.repo.eliminarTarifa(id);
    return ok(undefined);
  }
}
