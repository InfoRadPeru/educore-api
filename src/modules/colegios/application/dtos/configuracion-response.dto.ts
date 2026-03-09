// Qué es: DTO de respuesta para la configuración del colegio.

import { ApiProperty } from '@nestjs/swagger';

export class ConfiguracionResponseDto {
  @ApiProperty() id:              string;
  @ApiProperty() logoUrl:         string | null;
  @ApiProperty() colorPrimario:   string | null;
  @ApiProperty() colorSecundario: string | null;
  @ApiProperty() periodo:         string;
  @ApiProperty() zonaHoraria:     string;
  @ApiProperty() moneda:          string;
}