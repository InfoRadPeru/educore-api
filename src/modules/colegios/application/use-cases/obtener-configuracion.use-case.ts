// Qué es: Caso de uso — obtiene la configuración de branding del colegio.

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { ConfiguracionResponseDto } from '../dtos/configuracion-response.dto';

@Injectable()
export class ObtenerConfiguracionUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string): Promise<Result<ConfiguracionResponseDto>> {
    const config = await this.colegioRepository.findConfiguracion(colegioId);
    if (!config) return fail(new NotFoundError('Configuracion', colegioId));

    return ok({
      id:              config.id,
      logoUrl:         config.logoUrl,
      colorPrimario:   config.colorPrimario,
      colorSecundario: config.colorSecundario,
      periodo:         config.periodo,
      zonaHoraria:     config.zonaHoraria,
      moneda:          config.moneda,
    });
  }
}