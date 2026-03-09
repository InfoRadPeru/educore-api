// Qué es: DTO para que el PLATFORM_ADMIN suspenda o active un colegio.

import type { EstadoColegio } from '@modules/colegios/domain/entities/colegio.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class CambiarEstadoColegioDto {
  @ApiProperty({ enum: ['ACTIVO', 'SUSPENDIDO', 'INACTIVO'] })
  @IsIn(['ACTIVO', 'SUSPENDIDO', 'INACTIVO'])
  estado: EstadoColegio;
}