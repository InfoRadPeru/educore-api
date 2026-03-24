import { Inject, Injectable } from '@nestjs/common';
import { TESORERIA_REPOSITORY, type TesoreriaRepository } from '../../domain/repositories/tesoreria.repository';
import { Pago } from '../../domain/entities/pago.entity';

@Injectable()
export class ListarPagosUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}

  async execute(
    colegioId: string,
    filtros: { alumnoId?: string; añoAcademico?: number },
  ): Promise<Pago[]> {
    return this.repo.listarPagos(colegioId, filtros);
  }
}
