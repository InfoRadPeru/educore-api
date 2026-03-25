import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  HORARIO_REPOSITORY,
  type HorarioRepository,
} from '../../domain/repositories/horario.repository';
import { HorarioBloque, DiaSemana } from '../../domain/entities/horario-bloque.entity';

@Injectable()
export class AgregarBloqueUseCase {
  constructor(
    @Inject(HORARIO_REPOSITORY)
    private readonly repo: HorarioRepository,
  ) {}

  async execute(
    seccionId: string,
    añoAcademico: number,
    docenteAsignacionId: string,
    franjaHorariaId: string,
    diaSemana: DiaSemana,
    aula?: string,
  ): Promise<Result<HorarioBloque, NotFoundError | ConflictError>> {
    const horario = await this.repo.buscarHorarioPorSeccion(seccionId, añoAcademico);
    if (!horario) {
      return fail(new NotFoundError('HorarioSeccion', `${seccionId}-${añoAcademico}`));
    }

    // Conflicto: la sección ya tiene algo en ese slot
    const conflictoSeccion = await this.repo.verificarConflictoSeccion(
      horario.id, diaSemana, franjaHorariaId,
    );
    if (conflictoSeccion) {
      return fail(new ConflictError('La sección ya tiene una asignatura en ese horario'));
    }

    // Conflicto: el docente ya está en otro lugar en ese slot
    // (necesitamos el docenteId de la asignación — lo resolvemos en el repositorio)
    const conflictoDocente = await this.repo.verificarConflictoDocente(
      '', diaSemana, franjaHorariaId, añoAcademico,
    );
    // El repositorio debe recibir docenteAsignacionId y resolverlo internamente
    const conflictoDocenteReal = await this.verificarDocenteConAsignacionId(
      docenteAsignacionId, diaSemana, franjaHorariaId, añoAcademico, horario.id,
    );
    if (conflictoDocenteReal) {
      return fail(new ConflictError('El docente ya tiene clase en otro grupo a esa hora'));
    }

    const bloque = await this.repo.agregarBloque({
      horarioSeccionId: horario.id,
      docenteAsignacionId,
      franjaHorariaId,
      diaSemana,
      aula,
    });
    return ok(bloque);
  }

  private async verificarDocenteConAsignacionId(
    docenteAsignacionId: string,
    dia: DiaSemana,
    franjaHorariaId: string,
    añoAcademico: number,
    horarioSeccionId: string,
  ): Promise<boolean> {
    // Delegamos al repo con un parámetro especial: pasamos docenteAsignacionId
    // El repo lo resuelve a docenteId internamente
    return this.repo.verificarConflictoDocente(
      docenteAsignacionId, dia, franjaHorariaId, añoAcademico,
    );
  }
}
