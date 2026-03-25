import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  COLEGIO_ASIGNATURA_REPOSITORY,
  type ColegioAsignaturaRepository,
} from '../../domain/repositories/colegio-asignatura.repository';
import {
  GRADO_ASIGNATURA_REPOSITORY,
  type GradoAsignaturaRepository,
} from '../../domain/repositories/grado-asignatura.repository';
import { GradoAsignatura } from '../../domain/entities/grado-asignatura.entity';

export interface AsignarAsignaturaGradoDto {
  colegioGradoId:      string;
  colegioAsignaturaId: string;
  horasSemanales?:     number;
}

@Injectable()
export class AsignarAsignaturaGradoUseCase {
  constructor(
    @Inject(COLEGIO_ASIGNATURA_REPOSITORY)
    private readonly colegioAsignaturaRepo: ColegioAsignaturaRepository,
    @Inject(GRADO_ASIGNATURA_REPOSITORY)
    private readonly gradoRepo: GradoAsignaturaRepository,
  ) {}

  async execute(
    dto: AsignarAsignaturaGradoDto,
  ): Promise<Result<GradoAsignatura, NotFoundError | ConflictError>> {
    const colegioAsignatura = await this.colegioAsignaturaRepo.buscarPorId(dto.colegioAsignaturaId);
    if (!colegioAsignatura) return fail(new NotFoundError('ColegioAsignatura', dto.colegioAsignaturaId));
    if (!colegioAsignatura.activo) return fail(new ConflictError('La asignatura está inactiva en el colegio'));

    const yaExiste = await this.gradoRepo.existeEnGrado(dto.colegioGradoId, dto.colegioAsignaturaId);
    if (yaExiste) return fail(new ConflictError('La asignatura ya está asignada a este grado'));

    const gradoAsignatura = await this.gradoRepo.asignar(
      dto.colegioGradoId,
      dto.colegioAsignaturaId,
      dto.horasSemanales,
    );
    return ok(gradoAsignatura);
  }
}
