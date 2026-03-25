import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import { TESORERIA_REPOSITORY, type TesoreriaRepository } from '../../domain/repositories/tesoreria.repository';
import { Pago } from '../../domain/entities/pago.entity';
import type { MetodoPago } from '../../domain/entities/pago.entity';

export interface PagoItem { cuotaId: string; monto: number; }

export interface RegistrarPagoProps {
  colegioId:      string;
  registradoPorId: string;
  metodoPago:     MetodoPago;
  referencia?:    string;
  observacion?:   string;
  pagos:          PagoItem[];
}

@Injectable()
export class RegistrarPagoUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}

  async execute(props: RegistrarPagoProps): Promise<Result<Pago[], NotFoundError | ConflictError>> {
    const { colegioId, registradoPorId, metodoPago, referencia, observacion, pagos } = props;

    const creados: Pago[] = [];

    for (const item of pagos) {
      const cuota = await this.repo.buscarCuota(item.cuotaId);
      if (!cuota) return fail(new NotFoundError('CuotaAlumno', item.cuotaId));
      if (cuota.estaPagada()) return fail(new ConflictError(`La cuota ${item.cuotaId} ya está pagada`));

      const pago = await this.repo.crearPago({
        cuotaId:         item.cuotaId,
        colegioId,
        alumnoId:        cuota.alumnoId,
        registradoPorId,
        monto:           item.monto,
        metodoPago,
        referencia,
        observacion,
      });

      const nuevoMontoPagado = cuota.montoPagado + item.monto;
      const nuevoEstado      = nuevoMontoPagado >= cuota.monto ? 'PAGADA' : 'PENDIENTE';
      await this.repo.actualizarCuota(item.cuotaId, {
        montoPagado: nuevoMontoPagado,
        estado:      nuevoEstado as any,
      });

      creados.push(pago);
    }

    return ok(creados);
  }
}
