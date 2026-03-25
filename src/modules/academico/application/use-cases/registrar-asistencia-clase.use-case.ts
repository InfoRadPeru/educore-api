import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import {
  ASISTENCIA_REPOSITORY,
  type AsistenciaRepository,
} from '../../domain/repositories/asistencia.repository';
import { type EstadoAsistencia } from '../../domain/entities/asistencia.entity';
import { Asistencia } from '../../domain/entities/asistencia.entity';

export interface RegistroAsistenciaItem {
  alumnoId:     string;
  estado:       EstadoAsistencia;
  observacion?: string;
  registradoPorId: string;
}

export interface RegistrarAsistenciaClaseDto {
  docenteAsignacionId: string;
  fecha:               Date;
  registros:           RegistroAsistenciaItem[];
}

@Injectable()
export class RegistrarAsistenciaClaseUseCase {
  constructor(
    @Inject(ASISTENCIA_REPOSITORY)
    private readonly repo: AsistenciaRepository,
  ) {}

  async execute(dto: RegistrarAsistenciaClaseDto): Promise<Result<Asistencia[], never>> {
    const asistencias = await this.repo.upsertBulk(
      dto.docenteAsignacionId,
      dto.fecha,
      dto.registros,
    );
    return ok(asistencias);
  }
}
