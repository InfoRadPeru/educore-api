import { Inject, Injectable } from '@nestjs/common';
import { TESORERIA_REPOSITORY, type TesoreriaRepository } from '../../domain/repositories/tesoreria.repository';
import type { EstadoCuota } from '../../domain/entities/cuota-alumno.entity';

@Injectable()
export class ResumenFinancieroUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}

  async execute(colegioId: string, añoAcademico: number): Promise<{
    totalEsperado:   number;
    totalCobrado:    number;
    totalPendiente:  number;
    cuotasPorEstado: Record<EstadoCuota, number>;
  }> {
    return this.repo.resumenFinanciero(colegioId, añoAcademico);
  }
}
