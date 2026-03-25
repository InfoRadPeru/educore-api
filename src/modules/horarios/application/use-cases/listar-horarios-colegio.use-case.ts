import { Inject, Injectable } from '@nestjs/common';
import {
  HORARIO_REPOSITORY,
  type HorarioRepository,
} from '../../domain/repositories/horario.repository';
import { HorarioSeccion } from '../../domain/entities/horario-seccion.entity';

@Injectable()
export class ListarHorariosColegioUseCase {
  constructor(
    @Inject(HORARIO_REPOSITORY)
    private readonly repo: HorarioRepository,
  ) {}

  async execute(colegioId: string, añoAcademico: number): Promise<HorarioSeccion[]> {
    return this.repo.listarHorariosPorColegio(colegioId, añoAcademico);
  }
}
