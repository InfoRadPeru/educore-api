import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { POSTULACION_REPOSITORY, type PostulacionRepository } from '../../domain/repositories/postulacion.repository';
import type { EstadoPostulacion } from '../../domain/entities/postulacion.entity';
import { PostulacionResponseDto } from '../dtos/postulacion-response.dto';
import { toDto } from './crear-postulacion.use-case';

@Injectable()
export class ListarPostulacionesUseCase {
  constructor(
    @Inject(POSTULACION_REPOSITORY)
    private readonly postulacionRepository: PostulacionRepository,
  ) {}

  async execute(colegioId: string, estado?: EstadoPostulacion): Promise<Result<PostulacionResponseDto[]>> {
    const lista = await this.postulacionRepository.listarPorColegio(colegioId, estado);
    return ok(lista.map(toDto));
  }
}
