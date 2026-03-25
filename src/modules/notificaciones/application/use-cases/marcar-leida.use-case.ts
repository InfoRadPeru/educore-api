import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICACION_REPOSITORY, type NotificacionRepository } from '../../domain/repositories/notificacion.repository';

@Injectable()
export class MarcarLeidaUseCase {
  constructor(@Inject(NOTIFICACION_REPOSITORY) private readonly repo: NotificacionRepository) {}

  async execute(id: string, usuarioId: string): Promise<void> {
    await this.repo.marcarLeida(id, usuarioId);
  }
}
