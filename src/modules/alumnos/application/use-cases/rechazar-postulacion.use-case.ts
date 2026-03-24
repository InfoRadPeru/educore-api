import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import { POSTULACION_REPOSITORY, type PostulacionRepository } from '../../domain/repositories/postulacion.repository';
import { PostulacionResponseDto } from '../dtos/postulacion-response.dto';
import { toDto } from './crear-postulacion.use-case';

@Injectable()
export class RechazarPostulacionUseCase {
  constructor(
    @Inject(POSTULACION_REPOSITORY)
    private readonly postulacionRepository: PostulacionRepository,
  ) {}

  async execute(colegioId: string, postulacionId: string, observaciones?: string): Promise<Result<PostulacionResponseDto>> {
    const postulacion = await this.postulacionRepository.buscarPorId(postulacionId);
    if (!postulacion || postulacion.colegioId !== colegioId) return fail(new NotFoundError('Postulacion', postulacionId));
    if (!postulacion.esPendiente()) return fail(new ConflictError('Solo se pueden rechazar postulaciones en estado PENDIENTE'));

    postulacion.rechazar(observaciones);

    const actualizada = await this.postulacionRepository.actualizar(postulacionId, {
      estado:        postulacion.estado,
      observaciones: postulacion.observaciones,
    });

    return ok(toDto(actualizada));
  }
}
