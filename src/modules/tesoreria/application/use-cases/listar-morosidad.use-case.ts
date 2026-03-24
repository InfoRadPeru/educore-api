import { Inject, Injectable } from '@nestjs/common';
import { TESORERIA_REPOSITORY, type TesoreriaRepository, type MorosidadItem } from '../../domain/repositories/tesoreria.repository';

@Injectable()
export class ListarMorosidadUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}

  async execute(colegioId: string, añoAcademico: number): Promise<MorosidadItem[]> {
    return this.repo.listarMorosidad(colegioId, añoAcademico, new Date());
  }
}
