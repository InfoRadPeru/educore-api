import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ValidationError } from '@shared/domain/result';
import {
  ASISTENCIA_REPOSITORY,
  type AsistenciaRepository,
} from '../../domain/repositories/asistencia.repository';
import { Asistencia } from '../../domain/entities/asistencia.entity';

@Injectable()
export class ListarAsistenciasClaseUseCase {
  constructor(
    @Inject(ASISTENCIA_REPOSITORY)
    private readonly repo: AsistenciaRepository,
  ) {}

  async execute(docenteAsignacionId: string, fecha: Date): Promise<Result<Asistencia[], ValidationError>> {
    if (!docenteAsignacionId) return fail(new ValidationError('El parámetro docenteAsignacionId es requerido'));
    if (!fecha || isNaN(fecha.getTime())) return fail(new ValidationError('El parámetro fecha es requerido y debe ser una fecha válida'));
    return ok(await this.repo.listarPorAsignacionYFecha(docenteAsignacionId, fecha));
  }
}
