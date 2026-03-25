import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { DOCENTE_REPOSITORY, type DocenteRepository } from '../../domain/repositories/docente.repository';
import { Docente } from '../../domain/entities/docente.entity';

@Injectable()
export class ObtenerDocenteUseCase {
  constructor(
    @Inject(DOCENTE_REPOSITORY)
    private readonly docenteRepo: DocenteRepository,
  ) {}

  async execute(id: string, colegioId: string): Promise<Result<Docente, NotFoundError>> {
    const docente = await this.docenteRepo.buscarPorId(id);
    if (!docente || docente.colegioId !== colegioId) {
      return fail(new NotFoundError('Docente', id));
    }
    return ok(docente);
  }
}
