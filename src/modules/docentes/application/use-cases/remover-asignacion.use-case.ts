import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { DOCENTE_REPOSITORY, type DocenteRepository } from '../../domain/repositories/docente.repository';

@Injectable()
export class RemoverAsignacionUseCase {
  constructor(
    @Inject(DOCENTE_REPOSITORY)
    private readonly docenteRepo: DocenteRepository,
  ) {}

  async execute(asignacionId: string, colegioId: string): Promise<Result<void, NotFoundError>> {
    const asignacion = await this.docenteRepo.buscarAsignacion(asignacionId);
    if (!asignacion) return fail(new NotFoundError('DocenteAsignacion', asignacionId));

    // Validar pertenencia al colegio via el docente
    const docente = await this.docenteRepo.buscarPorId(asignacion.docenteId);
    if (!docente || docente.colegioId !== colegioId) {
      return fail(new NotFoundError('DocenteAsignacion', asignacionId));
    }

    await this.docenteRepo.removerAsignacion(asignacionId);
    return ok(undefined);
  }
}
