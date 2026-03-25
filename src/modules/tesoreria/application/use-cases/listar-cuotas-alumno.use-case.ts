import { Inject, Injectable } from '@nestjs/common';
import { TESORERIA_REPOSITORY, type TesoreriaRepository } from '../../domain/repositories/tesoreria.repository';
import { CuotaAlumno } from '../../domain/entities/cuota-alumno.entity';

@Injectable()
export class ListarCuotasAlumnoUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}

  async execute(alumnoId: string, añoAcademico: number): Promise<CuotaAlumno[]> {
    return this.repo.listarCuotasAlumno(alumnoId, añoAcademico);
  }
}
