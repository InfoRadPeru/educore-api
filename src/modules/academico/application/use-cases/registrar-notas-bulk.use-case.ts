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

export interface RegistrarNotaBulkDto {
  actividadId: string;
  notas:       { alumnoId: string; puntaje: number | null; observacion?: string }[];
}

@Injectable()
export class RegistrarNotasBulkUseCase {
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
    colegioId: string,
    usuarioId: string,
    dto:       RegistrarNotaBulkDto,
  ): Promise<Result<NotaActividad[], NotFoundError | ConflictError>> {
    const actividad = await this.actividadRepo.buscarPorId(dto.actividadId);
    if (!actividad || !actividad.activo) return fail(new NotFoundError('Actividad', dto.actividadId));

    const invalida = dto.notas.find(n => n.puntaje !== null && n.puntaje > actividad.puntajeMaximo);
    if (invalida)
      return fail(new ConflictError(`Puntaje ${invalida.puntaje} supera el máximo de ${actividad.puntajeMaximo}`));

    const notas = await this.notaRepo.upsertBulk(dto.actividadId, dto.notas, usuarioId);

    const config = await this.colegioRepo.buscarConfiguracion(colegioId);
    const notaMaxima   = config?.notaMaxima   ?? 20;
    const decimales    = config?.decimalesNota ?? 1;

    // Recalcular nota de periodo para cada alumno
    const alumnosUnicos = [...new Set(dto.notas.map(n => n.alumnoId))];
    await Promise.all(
      alumnosUnicos.map(alumnoId =>
        this.calculadora.recalcular(
          actividad.docenteAsignacionId,
          actividad.periodoId,
          alumnoId,
          usuarioId,
          notaMaxima,
          decimales,
        ),
      ),
    );

    return ok(notas);
  }
}
