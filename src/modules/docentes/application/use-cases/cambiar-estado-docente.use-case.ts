import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import { DOCENTE_REPOSITORY, type DocenteRepository } from '../../domain/repositories/docente.repository';
import { Docente, type EstadoDocente } from '../../domain/entities/docente.entity';

@Injectable()
export class CambiarEstadoDocenteUseCase {
  constructor(
    @Inject(DOCENTE_REPOSITORY)
    private readonly docenteRepo: DocenteRepository,
  ) {}

  async execute(
    id: string,
    colegioId: string,
    nuevoEstado: EstadoDocente,
  ): Promise<Result<Docente, NotFoundError | ConflictError>> {
    const docente = await this.docenteRepo.buscarPorId(id);
    if (!docente || docente.colegioId !== colegioId) {
      return fail(new NotFoundError('Docente', id));
    }
    if (docente.estado === nuevoEstado) {
      return fail(new ConflictError(`El docente ya está en estado ${nuevoEstado}`));
    }
    return ok(await this.docenteRepo.cambiarEstado(id, nuevoEstado));
  }
}
