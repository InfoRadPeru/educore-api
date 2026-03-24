import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  CATEGORIA_EVALUACION_REPOSITORY,
  type CategoriaEvaluacionRepository,
} from '../../domain/repositories/categoria-evaluacion.repository';
import { DOCENTE_REPOSITORY, type DocenteRepository } from '@modules/docentes/domain/repositories/docente.repository';
import { CategoriaEvaluacion } from '../../domain/entities/categoria-evaluacion.entity';

export interface CrearCategoriaDto {
  docenteAsignacionId: string;
  nombre:              string;
  peso:                number;
  orden:               number;
}

@Injectable()
export class CrearCategoriaUseCase {
  constructor(
    @Inject(CATEGORIA_EVALUACION_REPOSITORY)
    private readonly repo: CategoriaEvaluacionRepository,
    @Inject(DOCENTE_REPOSITORY)
    private readonly docenteRepo: DocenteRepository,
  ) {}

  async execute(
    colegioId: string,
    dto: CrearCategoriaDto,
  ): Promise<Result<CategoriaEvaluacion, NotFoundError | ConflictError>> {
    const asignacion = await this.docenteRepo.buscarAsignacion(dto.docenteAsignacionId);
    if (!asignacion) return fail(new NotFoundError('DocenteAsignacion', dto.docenteAsignacionId));

    const docente = await this.docenteRepo.buscarPorId(asignacion.docenteId);
    if (!docente || docente.colegioId !== colegioId)
      return fail(new NotFoundError('DocenteAsignacion', dto.docenteAsignacionId));

    const existeNombre = await this.repo.buscarPorNombreEnAsignacion(dto.docenteAsignacionId, dto.nombre);
    if (existeNombre) return fail(new ConflictError(`Ya existe la categoría "${dto.nombre}" en esta asignación`));

    const sumaPesos = await this.repo.sumaPesosPorAsignacion(dto.docenteAsignacionId);
    if (sumaPesos + dto.peso > 100)
      return fail(new ConflictError(`La suma de pesos excedería 100% (actual: ${sumaPesos}%)`));

    const categoria = await this.repo.crear(dto);
    return ok(categoria);
  }
}
