import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ValidationError } from '@shared/domain/result';
import {
  HORARIO_REPOSITORY,
  type HorarioRepository,
  type HorarioSeccionConBloques,
} from '../../domain/repositories/horario.repository';

@Injectable()
export class ObtenerHorarioSeccionUseCase {
  constructor(
    @Inject(HORARIO_REPOSITORY)
    private readonly repo: HorarioRepository,
  ) {}

  async execute(
    seccionId: string,
    añoAcademico: number,
  ): Promise<Result<HorarioSeccionConBloques, NotFoundError | ValidationError>> {
    if (!añoAcademico || isNaN(añoAcademico)) return fail(new ValidationError('El parámetro año es requerido'));
    const horario = await this.repo.buscarHorarioPorSeccion(seccionId, añoAcademico);
    if (!horario) {
      return fail(new NotFoundError('HorarioSeccion', `${seccionId}-${añoAcademico}`));
    }
    const conBloques = await this.repo.obtenerHorarioConBloques(horario.id);
    if (!conBloques) {
      return fail(new NotFoundError('HorarioSeccion', horario.id));
    }
    return ok(conBloques);
  }
}
