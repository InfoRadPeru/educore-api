import { Inject, Injectable } from '@nestjs/common';
import {
  FRANJA_HORARIA_REPOSITORY,
  type FranjaHorariaRepository,
} from '../../domain/repositories/franja-horaria.repository';
import { FranjaHoraria } from '../../domain/entities/franja-horaria.entity';

@Injectable()
export class ListarFranjasUseCase {
  constructor(
    @Inject(FRANJA_HORARIA_REPOSITORY)
    private readonly repo: FranjaHorariaRepository,
  ) {}

  async execute(colegioId: string): Promise<FranjaHoraria[]> {
    return this.repo.listarPorColegio(colegioId);
  }
}
