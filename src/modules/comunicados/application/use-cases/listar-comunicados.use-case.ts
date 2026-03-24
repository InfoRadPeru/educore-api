import { Inject, Injectable } from '@nestjs/common';
import {
  COMUNICADO_REPOSITORY,
  type ComunicadoRepository,
} from '../../domain/repositories/comunicado.repository';
import { Comunicado } from '../../domain/entities/comunicado.entity';

@Injectable()
export class ListarComunicadosUseCase {
  constructor(
    @Inject(COMUNICADO_REPOSITORY)
    private readonly repo: ComunicadoRepository,
  ) {}

  async execute(colegioId: string, año?: number): Promise<Comunicado[]> {
    return this.repo.listarPorColegio(colegioId, año);
  }
}
