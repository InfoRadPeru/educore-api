import { Inject, Injectable } from '@nestjs/common';
import { TESORERIA_REPOSITORY, type TesoreriaRepository } from '../../domain/repositories/tesoreria.repository';
import { ConceptoPago } from '../../domain/entities/concepto-pago.entity';

@Injectable()
export class ListarConceptosUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}
  async execute(colegioId: string): Promise<ConceptoPago[]> {
    return this.repo.listarConceptos(colegioId);
  }
}
