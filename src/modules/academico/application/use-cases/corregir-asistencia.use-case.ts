import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import {
  ASISTENCIA_REPOSITORY,
  type AsistenciaRepository,
} from '../../domain/repositories/asistencia.repository';
import { type EstadoAsistencia, Asistencia } from '../../domain/entities/asistencia.entity';

export interface CorregirAsistenciaDto {
  docenteAsignacionId: string;
  alumnoId:            string;
  fecha:               Date;
  estado:              EstadoAsistencia;
  observacion?:        string;
  registradoPorId:     string;
}

@Injectable()
export class CorregirAsistenciaUseCase {
  constructor(
    @Inject(ASISTENCIA_REPOSITORY)
    private readonly repo: AsistenciaRepository,
  ) {}

  async execute(dto: CorregirAsistenciaDto): Promise<Result<Asistencia, NotFoundError>> {
    const existente = await this.repo.buscarPorAsignacionAlumnoFecha(
      dto.docenteAsignacionId, dto.alumnoId, dto.fecha,
    );
    if (!existente) return fail(new NotFoundError('Asistencia', `${dto.alumnoId}-${dto.fecha.toISOString()}`));

    const actualizada = await this.repo.upsert({
      docenteAsignacionId: dto.docenteAsignacionId,
      alumnoId:            dto.alumnoId,
      fecha:               dto.fecha,
      estado:              dto.estado,
      observacion:         dto.observacion,
      registradoPorId:     dto.registradoPorId,
    });
    return ok(actualizada);
  }
}
