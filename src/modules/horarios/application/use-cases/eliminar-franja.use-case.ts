import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  FRANJA_HORARIA_REPOSITORY,
  type FranjaHorariaRepository,
} from '../../domain/repositories/franja-horaria.repository';

@Injectable()
export class EliminarFranjaUseCase {
  constructor(
    @Inject(FRANJA_HORARIA_REPOSITORY)
    private readonly repo: FranjaHorariaRepository,
  ) {}

  async execute(
    id: string,
    colegioId: string,
  ): Promise<Result<void, NotFoundError | ConflictError>> {
    const franja = await this.repo.buscarPorId(id);
    if (!franja || franja.colegioId !== colegioId) {
      return fail(new NotFoundError('FranjaHoraria', id));
    }
    const usada = await this.repo.tieneBloques(id);
    if (usada) {
      return fail(new ConflictError('No se puede eliminar una franja que tiene bloques asignados'));
    }
    await this.repo.eliminar(id);
    return ok(undefined);
  }
}
