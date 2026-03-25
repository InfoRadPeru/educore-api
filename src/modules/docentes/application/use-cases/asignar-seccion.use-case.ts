import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import { DOCENTE_REPOSITORY, type DocenteRepository } from '../../domain/repositories/docente.repository';
import { COLEGIO_ASIGNATURA_REPOSITORY, type ColegioAsignaturaRepository } from '@modules/asignaturas/domain/repositories/colegio-asignatura.repository';
import { DocenteAsignacion } from '../../domain/entities/docente.entity';

export interface AsignarSeccionDto {
  seccionId:           string;
  colegioAsignaturaId: string;
  añoAcademico:        number;
  esTutor:             boolean;
}

@Injectable()
export class AsignarSeccionUseCase {
  constructor(
    @Inject(DOCENTE_REPOSITORY)
    private readonly docenteRepo: DocenteRepository,
    @Inject(COLEGIO_ASIGNATURA_REPOSITORY)
    private readonly asignaturaRepo: ColegioAsignaturaRepository,
  ) {}

  async execute(
    docenteId: string,
    colegioId: string,
    dto: AsignarSeccionDto,
  ): Promise<Result<DocenteAsignacion, NotFoundError | ConflictError>> {
    const docente = await this.docenteRepo.buscarPorId(docenteId);
    if (!docente || docente.colegioId !== colegioId) {
      return fail(new NotFoundError('Docente', docenteId));
    }
    if (!docente.estaActivo()) {
      return fail(new ConflictError('El docente no está activo'));
    }

    const asignatura = await this.asignaturaRepo.buscarPorId(dto.colegioAsignaturaId);
    if (!asignatura || asignatura.colegioId !== colegioId || !asignatura.activo) {
      return fail(new NotFoundError('ColegioAsignatura', dto.colegioAsignaturaId));
    }

    const yaAsignado = await this.docenteRepo.existeAsignacion(
      docenteId, dto.seccionId, dto.colegioAsignaturaId, dto.añoAcademico,
    );
    if (yaAsignado) {
      return fail(new ConflictError('El docente ya dicta esa asignatura en esa sección ese año'));
    }

    if (dto.esTutor) {
      const yaTutorEnColegio = await this.docenteRepo.esTutorEnColegio(docenteId, colegioId, dto.añoAcademico);
      if (yaTutorEnColegio) {
        return fail(new ConflictError(`El docente ya es tutor de otra sección en este colegio en ${dto.añoAcademico}`));
      }
      const seccionTieneTutor = await this.docenteRepo.existeTutorEnSeccion(dto.seccionId, dto.añoAcademico);
      if (seccionTieneTutor) {
        return fail(new ConflictError(`La sección ya tiene un tutor asignado en ${dto.añoAcademico}`));
      }
    }

    const asignacion = await this.docenteRepo.asignarSeccion({ docenteId, ...dto });
    return ok(asignacion);
  }
}
