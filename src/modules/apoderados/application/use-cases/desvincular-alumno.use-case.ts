import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { APODERADO_REPOSITORY, type ApoderadoRepository } from '../../domain/repositories/apoderado.repository';

@Injectable()
export class DesvincularAlumnoUseCase {
  constructor(
    @Inject(APODERADO_REPOSITORY)
    private readonly apoderadoRepo: ApoderadoRepository,
  ) {}

  async execute(apoderadoId: string, alumnoId: string): Promise<Result<void, NotFoundError>> {
    const vinculado = await this.apoderadoRepo.existeVinculo(apoderadoId, alumnoId);
    if (!vinculado) return fail(new NotFoundError('Vínculo apoderado-alumno', alumnoId));

    await this.apoderadoRepo.desvincularAlumno(apoderadoId, alumnoId);
    return ok(undefined);
  }
}
