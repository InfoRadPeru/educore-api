import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import {
  TESORERIA_REPOSITORY, type TesoreriaRepository, type ConfigurarTarifaProps,
} from '../../domain/repositories/tesoreria.repository';
import { TarifaConcepto } from '../../domain/entities/tarifa-concepto.entity';

@Injectable()
export class ConfigurarTarifaUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}

  async execute(props: ConfigurarTarifaProps): Promise<Result<TarifaConcepto>> {
    const tarifa = await this.repo.configurarTarifa(props);
    return ok(tarifa);
  }
}
