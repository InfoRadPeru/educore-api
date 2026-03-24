import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import {
  ACTIVIDAD_REPOSITORY,
  type ActividadRepository,
} from '../../domain/repositories/actividad.repository';
import {
  NOTA_ACTIVIDAD_REPOSITORY,
  type NotaActividadRepository,
} from '../../domain/repositories/nota-actividad.repository';
import { NotaActividad } from '../../domain/entities/nota-actividad.entity';

@Injectable()
export class ListarNotasActividadUseCase {
  constructor(
    @Inject(ACTIVIDAD_REPOSITORY)
    private readonly actividadRepo: ActividadRepository,
    @Inject(NOTA_ACTIVIDAD_REPOSITORY)
    private readonly notaRepo: NotaActividadRepository,
  ) {}

  async execute(actividadId: string): Promise<Result<NotaActividad[], NotFoundError>> {
    const actividad = await this.actividadRepo.buscarPorId(actividadId);
    if (!actividad) return fail(new NotFoundError('Actividad', actividadId));

    return ok(await this.notaRepo.listarPorActividad(actividadId));
  }
}
