import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ConflictError } from '@shared/domain/result';
import {
  HORARIO_REPOSITORY,
  type HorarioRepository,
} from '../../domain/repositories/horario.repository';
import { HorarioSeccion } from '../../domain/entities/horario-seccion.entity';

@Injectable()
export class CrearHorarioSeccionUseCase {
  constructor(
    @Inject(HORARIO_REPOSITORY)
    private readonly repo: HorarioRepository,
  ) {}

  async execute(
    seccionId: string,
    añoAcademico: number,
  ): Promise<Result<HorarioSeccion, ConflictError>> {
    const existente = await this.repo.buscarHorarioPorSeccion(seccionId, añoAcademico);
    if (existente) {
      return fail(new ConflictError(`Ya existe un horario para esta sección en ${añoAcademico}`));
    }
    const horario = await this.repo.crearHorario(seccionId, añoAcademico, false);
    return ok(horario);
  }
}
