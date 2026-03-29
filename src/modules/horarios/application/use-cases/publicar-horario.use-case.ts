import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError, ValidationError } from '@shared/domain/result';
import {
  HORARIO_REPOSITORY,
  type HorarioRepository,
} from '../../domain/repositories/horario.repository';
import { HorarioSeccion } from '../../domain/entities/horario-seccion.entity';

@Injectable()
export class PublicarHorarioUseCase {
  constructor(
    @Inject(HORARIO_REPOSITORY)
    private readonly repo: HorarioRepository,
  ) {}

  async execute(
    seccionId: string,
    añoAcademico: number,
  ): Promise<Result<HorarioSeccion, NotFoundError | ConflictError | ValidationError>> {
    if (!añoAcademico || isNaN(añoAcademico)) return fail(new ValidationError('El parámetro año es requerido'));
    const horario = await this.repo.buscarHorarioPorSeccion(seccionId, añoAcademico);
    if (!horario) {
      return fail(new NotFoundError('HorarioSeccion', `${seccionId}-${añoAcademico}`));
    }
    if (!horario.esBorrador()) {
      return fail(new ConflictError('El horario ya está publicado'));
    }
    const publicado = await this.repo.cambiarEstadoHorario(horario.id, 'PUBLICADO');
    return ok(publicado);
  }
}
