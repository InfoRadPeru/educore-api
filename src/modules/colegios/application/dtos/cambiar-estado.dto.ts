// Qué es: DTO para cambiar estado activo/inactivo de sede o nivel.

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CambiarEstadoDto {
  @ApiProperty()
  @IsBoolean()
  activo: boolean;
}