import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { TESORERIA_REPOSITORY, type TesoreriaRepository } from '../../domain/repositories/tesoreria.repository';
import { ConceptoPago } from '../../domain/entities/concepto-pago.entity';

@Injectable()
export class ActualizarConceptoUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}

  async execute(
    id: string, colegioId: string, props: Partial<{ nombre: string; activo: boolean }>,
  ): Promise<Result<ConceptoPago, NotFoundError>> {
    const concepto = await this.repo.buscarConceptoPorId(id);
    if (!concepto || concepto.colegioId !== colegioId) return fail(new NotFoundError('ConceptoPago', id));
    const actualizado = await this.repo.actualizarConcepto(id, props);
    return ok(actualizado);
  }
}
