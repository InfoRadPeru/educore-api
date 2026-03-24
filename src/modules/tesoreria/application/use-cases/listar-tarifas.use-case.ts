import { Inject, Injectable } from '@nestjs/common';
import { TESORERIA_REPOSITORY, type TesoreriaRepository } from '../../domain/repositories/tesoreria.repository';
import { TarifaConcepto } from '../../domain/entities/tarifa-concepto.entity';

@Injectable()
export class ListarTarifasUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}
  async execute(colegioId: string, añoAcademico: number): Promise<TarifaConcepto[]> {
    return this.repo.listarTarifas(colegioId, añoAcademico);
  }
}
