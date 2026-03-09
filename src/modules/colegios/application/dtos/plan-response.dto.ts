// Qué es: DTO de respuesta para información del plan con límites y uso actual.

import { ApiProperty } from '@nestjs/swagger';

export class PlanResponseDto {
  @ApiProperty() plan:                    string;
  @ApiProperty() planVenceEn:             Date | null;
  @ApiProperty() limitesSedes:            number;
  @ApiProperty() sedesActivas:            number;
  @ApiProperty() limitesSeccionesPorGrado: number | null;
  @ApiProperty() planSugerido:            string | null;
}