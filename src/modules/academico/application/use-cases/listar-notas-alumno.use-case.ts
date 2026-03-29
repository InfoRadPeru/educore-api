import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ValidationError } from '@shared/domain/result';
import {
  NOTA_ACTIVIDAD_REPOSITORY,
  type NotaActividadRepository,
} from '../../domain/repositories/nota-actividad.repository';
import { NotaActividad } from '../../domain/entities/nota-actividad.entity';

@Injectable()
export class ListarNotasAlumnoUseCase {
  constructor(
    @Inject(NOTA_ACTIVIDAD_REPOSITORY)
    private readonly repo: NotaActividadRepository,
  ) {}

  async execute(alumnoId: string, docenteAsignacionId: string): Promise<Result<NotaActividad[], ValidationError>> {
    if (!docenteAsignacionId) return fail(new ValidationError('El parámetro docenteAsignacionId es requerido'));
    return ok(await this.repo.listarPorAlumnoYAsignacion(alumnoId, docenteAsignacionId));
  }
}
