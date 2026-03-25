import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ConflictError } from '@shared/domain/result';
import {
  TESORERIA_REPOSITORY, type TesoreriaRepository, type CrearConceptoProps,
} from '../../domain/repositories/tesoreria.repository';
import { ConceptoPago } from '../../domain/entities/concepto-pago.entity';

@Injectable()
export class CrearConceptoUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}

  async execute(props: CrearConceptoProps): Promise<Result<ConceptoPago, ConflictError>> {
    const existentes = await this.repo.listarConceptos(props.colegioId);
    if (existentes.some(c => c.nombre.toLowerCase() === props.nombre.toLowerCase())) {
      return fail(new ConflictError(`Ya existe un concepto llamado "${props.nombre}"`));
    }
    const concepto = await this.repo.crearConcepto(props);
    return ok(concepto);
  }
}
