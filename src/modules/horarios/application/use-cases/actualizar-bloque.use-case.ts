import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  HORARIO_REPOSITORY,
  type HorarioRepository,
  type ActualizarBloqueProps,
} from '../../domain/repositories/horario.repository';
import { HorarioBloque, DiaSemana } from '../../domain/entities/horario-bloque.entity';

@Injectable()
export class ActualizarBloqueUseCase {
  constructor(
    @Inject(HORARIO_REPOSITORY)
    private readonly repo: HorarioRepository,
  ) {}

  async execute(
    bloqueId: string,
    props: ActualizarBloqueProps,
  ): Promise<Result<HorarioBloque, NotFoundError | ConflictError>> {
    const bloque = await this.repo.buscarBloque(bloqueId);
    if (!bloque) return fail(new NotFoundError('HorarioBloque', bloqueId));

    const horario = await this.repo.buscarHorarioPorId(bloque.horarioSeccionId);
    if (!horario) return fail(new NotFoundError('HorarioSeccion', bloque.horarioSeccionId));

    const nuevoDia    = (props.diaSemana        ?? bloque.diaSemana)        as DiaSemana;
    const nuevaFranja = props.franjaHorariaId   ?? bloque.franjaHorariaId;

    // Si cambia el slot, verificar conflictos
    if (props.diaSemana || props.franjaHorariaId) {
      const conflictoSeccion = await this.repo.verificarConflictoSeccion(
        horario.id, nuevoDia, nuevaFranja, bloqueId,
      );
      if (conflictoSeccion) {
        return fail(new ConflictError('La sección ya tiene una asignatura en ese horario'));
      }

      const docenteAsignacionId = props.docenteAsignacionId ?? bloque.docenteAsignacionId;
      const conflictoDocente = await this.repo.verificarConflictoDocente(
        docenteAsignacionId, nuevoDia, nuevaFranja, horario.añoAcademico, bloqueId,
      );
      if (conflictoDocente) {
        return fail(new ConflictError('El docente ya tiene clase en otro grupo a esa hora'));
      }
    }

    const actualizado = await this.repo.actualizarBloque(bloqueId, props);
    return ok(actualizado);
  }
}
