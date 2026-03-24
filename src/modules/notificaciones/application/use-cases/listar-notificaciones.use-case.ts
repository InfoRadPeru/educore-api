import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICACION_REPOSITORY, type NotificacionRepository } from '../../domain/repositories/notificacion.repository';
import { Notificacion } from '../../domain/entities/notificacion.entity';

@Injectable()
export class ListarNotificacionesUseCase {
  constructor(@Inject(NOTIFICACION_REPOSITORY) private readonly repo: NotificacionRepository) {}

  async execute(usuarioId: string, soloNoLeidas = false): Promise<{
    notificaciones: Notificacion[];
    noLeidas: number;
  }> {
    const [notificaciones, noLeidas] = await Promise.all([
      this.repo.listarPorUsuario(usuarioId, soloNoLeidas),
      this.repo.contarNoLeidas(usuarioId),
    ]);
    return { notificaciones, noLeidas };
  }
}
