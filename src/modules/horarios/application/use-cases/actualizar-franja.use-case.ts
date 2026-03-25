import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import {
  FRANJA_HORARIA_REPOSITORY,
  type FranjaHorariaRepository,
  type ActualizarFranjaProps,
} from '../../domain/repositories/franja-horaria.repository';
import { FranjaHoraria } from '../../domain/entities/franja-horaria.entity';

@Injectable()
export class ActualizarFranjaUseCase {
  constructor(
    @Inject(FRANJA_HORARIA_REPOSITORY)
    private readonly repo: FranjaHorariaRepository,
  ) {}

  async execute(
    id: string,
    colegioId: string,
    props: ActualizarFranjaProps,
  ): Promise<Result<FranjaHoraria, NotFoundError>> {
    const franja = await this.repo.buscarPorId(id);
    if (!franja || franja.colegioId !== colegioId) {
      return fail(new NotFoundError('FranjaHoraria', id));
    }
    const actualizada = await this.repo.actualizar(id, props);
    return ok(actualizada);
  }
}
