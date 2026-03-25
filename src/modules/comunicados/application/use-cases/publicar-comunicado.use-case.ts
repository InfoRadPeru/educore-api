import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ForbiddenError } from '@shared/domain/result';
import {
  COMUNICADO_REPOSITORY,
  type ComunicadoRepository,
} from '../../domain/repositories/comunicado.repository';
import { Comunicado } from '../../domain/entities/comunicado.entity';
import { NotificacionService } from '@modules/notificaciones/application/notificacion.service';

@Injectable()
export class PublicarComunicadoUseCase {
  constructor(
    @Inject(COMUNICADO_REPOSITORY)
    private readonly repo: ComunicadoRepository,
    private readonly notificacionService: NotificacionService,
  ) {}

  async execute(
    id: string,
    colegioId: string,
  ): Promise<Result<Comunicado, NotFoundError | ForbiddenError>> {
    const comunicado = await this.repo.buscarPorId(id);
    if (!comunicado) return fail(new NotFoundError('Comunicado', id));
    if (comunicado.colegioId !== colegioId) return fail(new NotFoundError('Comunicado', id));
    if (!comunicado.esBorrador()) {
      return fail(new ForbiddenError('Solo se pueden publicar comunicados en estado BORRADOR'));
    }

    const publicado = await this.repo.cambiarEstado(id, 'PUBLICADO', new Date());

    // Despachar notificaciones de forma asíncrona (fire-and-forget, no bloquea la respuesta)
    this.notificacionService.despacharParaComunicado(
      publicado.id,
      publicado.titulo,
      {
        colegioId:      publicado.colegioId,
        audiencia:      publicado.audiencia,
        colegioNivelId: publicado.colegioNivelId,
        colegioGradoId: publicado.colegioGradoId,
        seccionId:      publicado.seccionId,
        destinatarioId: publicado.destinatarioId,
        añoAcademico:   publicado.añoAcademico,
      },
    ).catch(() => { /* notificaciones son best-effort */ });

    return ok(publicado);
  }
}
