import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ConflictError } from '@shared/domain/result';
import {
  FRANJA_HORARIA_REPOSITORY,
  type FranjaHorariaRepository,
  type CrearFranjaProps,
} from '../../domain/repositories/franja-horaria.repository';
import { FranjaHoraria } from '../../domain/entities/franja-horaria.entity';

@Injectable()
export class CrearFranjaUseCase {
  constructor(
    @Inject(FRANJA_HORARIA_REPOSITORY)
    private readonly repo: FranjaHorariaRepository,
  ) {}

  async execute(props: CrearFranjaProps): Promise<Result<FranjaHoraria, ConflictError>> {
    const existentes = await this.repo.listarPorColegio(props.colegioId);
    const conflictoHora = existentes.some(
      f => f.horaInicio === props.horaInicio && f.horaFin === props.horaFin,
    );
    if (conflictoHora) {
      return fail(new ConflictError(`Ya existe una franja con horario ${props.horaInicio}-${props.horaFin}`));
    }
    const conflictoOrden = existentes.some(f => f.orden === props.orden);
    if (conflictoOrden) {
      return fail(new ConflictError(`Ya existe una franja con orden ${props.orden}`));
    }

    const franja = await this.repo.crear(props);
    return ok(franja);
  }
}
