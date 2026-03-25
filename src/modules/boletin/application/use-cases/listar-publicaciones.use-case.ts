import { Inject, Injectable } from '@nestjs/common';
import {
  PUBLICACION_BOLETIN_REPOSITORY,
  type PublicacionBoletinRepository,
} from '../../domain/repositories/publicacion-boletin.repository';
import { PublicacionBoletin } from '../../domain/entities/publicacion-boletin.entity';

@Injectable()
export class ListarPublicacionesUseCase {
  constructor(
    @Inject(PUBLICACION_BOLETIN_REPOSITORY)
    private readonly repo: PublicacionBoletinRepository,
  ) {}

  async execute(seccionId: string): Promise<PublicacionBoletin[]> {
    return this.repo.listarPorSeccion(seccionId);
  }
}
