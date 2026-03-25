import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ConflictError, NotFoundError } from '@shared/domain/result';
import { APODERADO_REPOSITORY, type ApoderadoRepository } from '../../domain/repositories/apoderado.repository';
import { ALUMNO_REPOSITORY, type AlumnoRepository } from '@modules/alumnos/domain/repositories/alumno.repository';
import { type TipoParentesco, VinculoAlumno } from '../../domain/entities/apoderado.entity';

export interface AsignarAlumnoDto {
  apoderadoId: string;
  alumnoId:    string;
  parentesco:  TipoParentesco;
}

const MAX_APODERADOS_POR_ALUMNO = 2;

@Injectable()
export class AsignarAlumnoUseCase {
  constructor(
    @Inject(APODERADO_REPOSITORY)
    private readonly apoderadoRepo: ApoderadoRepository,
    @Inject(ALUMNO_REPOSITORY)
    private readonly alumnoRepo: AlumnoRepository,
  ) {}

  async execute(colegioId: string, dto: AsignarAlumnoDto): Promise<Result<VinculoAlumno, NotFoundError | ConflictError>> {
    const apoderado = await this.apoderadoRepo.buscarPorId(dto.apoderadoId);
    if (!apoderado) return fail(new NotFoundError('Apoderado', dto.apoderadoId));

    const alumno = await this.alumnoRepo.buscarPorId(dto.alumnoId);
    if (!alumno || alumno.colegioId !== colegioId) return fail(new NotFoundError('Alumno', dto.alumnoId));

    const yaVinculado = await this.apoderadoRepo.existeVinculo(dto.apoderadoId, dto.alumnoId);
    if (yaVinculado) return fail(new ConflictError('El apoderado ya está vinculado a este alumno'));

    const totalVinculos = await this.apoderadoRepo.contarVinculosPorAlumno(dto.alumnoId);
    if (totalVinculos >= MAX_APODERADOS_POR_ALUMNO) {
      return fail(new ConflictError(`El alumno ya tiene ${MAX_APODERADOS_POR_ALUMNO} apoderados asignados`));
    }

    const parentescoOcupado = await this.apoderadoRepo.existeParentescoPorAlumno(dto.alumnoId, dto.parentesco);
    if (parentescoOcupado) {
      return fail(new ConflictError(`El alumno ya tiene un apoderado con parentesco ${dto.parentesco}`));
    }

    const vinculo = await this.apoderadoRepo.asignarAlumno(dto.apoderadoId, dto.alumnoId, dto.parentesco);
    return ok(vinculo);
  }
}
