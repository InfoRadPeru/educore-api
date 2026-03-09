// Qué es: Caso de uso — actualiza la configuración de branding del colegio.

import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { ActualizarConfiguracionDto } from '../dtos/actualizar-configuracion.dto';
import { ConfiguracionResponseDto } from '../dtos/configuracion-response.dto';

@Injectable()
export class ActualizarConfiguracionUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string, dto: ActualizarConfiguracionDto): Promise<Result<ConfiguracionResponseDto>> {
    const config = await this.colegioRepository.actualizarConfiguracion(colegioId, dto);

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