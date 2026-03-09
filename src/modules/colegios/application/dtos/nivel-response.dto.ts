// Qué es: DTO de respuesta para un nivel con su estado de activación en el colegio.

import { ApiProperty } from '@nestjs/swagger';

export class NivelResponseDto {
  @ApiProperty() id:             string;
  @ApiProperty() nivelMaestroId: string;
  @ApiProperty() nombre:         string;
  @ApiProperty() orden:          number;
  @ApiProperty() activo:         boolean;
  @ApiProperty() turnos:         string[];
}