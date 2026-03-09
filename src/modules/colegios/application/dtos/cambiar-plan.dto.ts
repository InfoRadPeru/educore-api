// Qué es: DTO para que el PLATFORM_ADMIN cambie el plan de un colegio.

import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class CambiarPlanDto {
  @ApiProperty({ enum: ['BASICO', 'PREMIUM', 'ENTERPRISE'] })
  @IsIn(['BASICO', 'PREMIUM', 'ENTERPRISE'])
  plan: string;
}