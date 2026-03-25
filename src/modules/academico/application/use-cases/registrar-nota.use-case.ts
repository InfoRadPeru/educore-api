import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  ACTIVIDAD_REPOSITORY,
  type ActividadRepository,
} from '../../domain/repositories/actividad.repository';
import {
  NOTA_ACTIVIDAD_REPOSITORY,
  type NotaActividadRepository,
} from '../../domain/repositories/nota-actividad.repository';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '@modules/colegios/domain/repositories/colegio.repository';
import { NotaCalculadoraService } from '../nota-calculadora.service';
import { NotaActividad } from '../../domain/entities/nota-actividad.entity';

export interface RegistrarNotaDto {
  actividadId:     string;
  alumnoId:        string;
  puntaje:         number | null;
  observacion?:    string;
  motivo?:         string;
}

@Injectable()
export class RegistrarNotaUseCase {
  constructor(
    @Inject(ACTIVIDAD_REPOSITORY)
    private readonly actividadRepo: ActividadRepository,
    @Inject(NOTA_ACTIVIDAD_REPOSITORY)
    private readonly notaRepo: NotaActividadRepository,
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepo: ColegioRepository,
    private readonly calculadora: NotaCalculadoraService,
  ) {}

  async execute(
    colegioId:     string,
    usuarioId:     string,
    dto:           RegistrarNotaDto,
  ): Promise<Result<NotaActividad, NotFoundError | ConflictError>> {
    const actividad = await this.actividadRepo.buscarPorId(dto.actividadId);
    if (!actividad || !actividad.activo) return fail(new NotFoundError('Actividad', dto.actividadId));

    if (dto.puntaje !== null && dto.puntaje > actividad.puntajeMaximo)
      return fail(new ConflictError(`El puntaje ${dto.puntaje} supera el máximo de ${actividad.puntajeMaximo}`));

    const nota = await this.notaRepo.upsert({
      actividadId:     dto.actividadId,
      alumnoId:        dto.alumnoId,
      puntaje:         dto.puntaje,
      observacion:     dto.observacion,
      calificadoPorId: usuarioId,
      motivo:          dto.motivo,
    });

    // Recalcular nota del periodo automáticamente
    const config = await this.colegioRepo.buscarConfiguracion(colegioId);
    await this.calculadora.recalcular(
      actividad.docenteAsignacionId,
      actividad.periodoId,
      dto.alumnoId,
      usuarioId,
      config?.notaMaxima  ?? 20,
      config?.decimalesNota ?? 1,
    );

    return ok(nota);
  }
}
