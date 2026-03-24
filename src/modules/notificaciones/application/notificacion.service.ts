import { Inject, Injectable } from '@nestjs/common';
import {
  NOTIFICACION_REPOSITORY,
  type NotificacionRepository,
  type AudienciaComunicado,
} from '../domain/repositories/notificacion.repository';

/**
 * Exported application service.
 * Used by other modules (e.g. ComunicadosModule) to dispatch notifications
 * without needing to know about the persistence details.
 */
@Injectable()
export class NotificacionService {
  constructor(
    @Inject(NOTIFICACION_REPOSITORY) private readonly repo: NotificacionRepository,
  ) {}

  async despacharParaComunicado(
    comunicadoId: string,
    titulo: string,
    audiencia: AudienciaComunicado,
  ): Promise<void> {
    const usuarioIds = await this.repo.resolverDestinatarios(audiencia);
    if (!usuarioIds.length) return;

    await this.repo.crearBulk(
      usuarioIds.map((uid) => ({
        usuarioId:   uid,
        tipo:        'COMUNICADO' as const,
        titulo:      `Nuevo comunicado: ${titulo}`,
        mensaje:     `Se ha publicado un nuevo comunicado: "${titulo}"`,
        entidadTipo: 'Comunicado',
        entidadId:   comunicadoId,
      })),
    );
  }
}
