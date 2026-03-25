import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import { TESORERIA_REPOSITORY, type TesoreriaRepository } from '../../domain/repositories/tesoreria.repository';
import { Pago } from '../../domain/entities/pago.entity';

@Injectable()
export class AnularPagoUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}

  async execute(id: string, colegioId: string, motivo: string): Promise<Result<Pago, NotFoundError | ConflictError>> {
    const pago = await this.repo.buscarPago(id);
    if (!pago || pago.colegioId !== colegioId) return fail(new NotFoundError('Pago', id));
    if (!pago.estaRegistrado()) return fail(new ConflictError('El pago ya fue anulado'));

    // Revertir montoPagado en la cuota
    const cuota = await this.repo.buscarCuota(pago.cuotaId);
    if (cuota) {
      const montoPagadoActualizado = Math.max(0, cuota.montoPagado - pago.monto);
      await this.repo.actualizarCuota(pago.cuotaId, {
        montoPagado: montoPagadoActualizado,
        estado:      montoPagadoActualizado > 0 ? 'PENDIENTE' : 'PENDIENTE',
      });
    }

    const anulado = await this.repo.anularPago(id, motivo);
    return ok(anulado);
  }
}
