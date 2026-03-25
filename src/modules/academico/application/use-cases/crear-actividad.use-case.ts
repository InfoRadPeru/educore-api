import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  ACTIVIDAD_REPOSITORY,
  type ActividadRepository,
  type CrearActividadProps,
} from '../../domain/repositories/actividad.repository';
import {
  CATEGORIA_EVALUACION_REPOSITORY,
  type CategoriaEvaluacionRepository,
} from '../../domain/repositories/categoria-evaluacion.repository';
import {
  PERIODO_EVALUACION_REPOSITORY,
  type PeriodoEvaluacionRepository,
} from '../../domain/repositories/periodo-evaluacion.repository';
import { Actividad } from '../../domain/entities/actividad.entity';

@Injectable()
export class CrearActividadUseCase {
  constructor(
    @Inject(ACTIVIDAD_REPOSITORY)
    private readonly actividadRepo: ActividadRepository,
    @Inject(CATEGORIA_EVALUACION_REPOSITORY)
    private readonly categoriaRepo: CategoriaEvaluacionRepository,
    @Inject(PERIODO_EVALUACION_REPOSITORY)
    private readonly periodoRepo: PeriodoEvaluacionRepository,
  ) {}

  async execute(props: CrearActividadProps): Promise<Result<Actividad, NotFoundError | ConflictError>> {
    const categoria = await this.categoriaRepo.buscarPorId(props.categoriaId);
    if (!categoria) return fail(new NotFoundError('CategoriaEvaluacion', props.categoriaId));
    if (!categoria.activo) return fail(new ConflictError('La categoría está inactiva'));
    if (categoria.docenteAsignacionId !== props.docenteAsignacionId)
      return fail(new ConflictError('La categoría no pertenece a esta asignación docente'));

    const periodo = await this.periodoRepo.buscarPorId(props.periodoId);
    if (!periodo) return fail(new NotFoundError('PeriodoEvaluacion', props.periodoId));
    if (!periodo.activo) return fail(new ConflictError('El periodo no está activo'));

    const actividad = await this.actividadRepo.crear(props);
    return ok(actividad);
  }
}
