import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICACION_REPOSITORY, type NotificacionRepository } from '../../domain/repositories/notificacion.repository';

@Injectable()
export class MarcarTodasLeidasUseCase {
  constructor(@Inject(NOTIFICACION_REPOSITORY) private readonly repo: NotificacionRepository) {}

  async execute(usuarioId: string): Promise<void> {
    await this.repo.marcarTodasLeidas(usuarioId);
  }
}
