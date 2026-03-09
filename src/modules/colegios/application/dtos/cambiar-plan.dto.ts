// Qué es: DTO para que el PLATFORM_ADMIN cambie el plan de un colegio.

import type { PlanColegio } from '@modules/colegios/domain/entities/colegio.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class CambiarPlanDto {
  @ApiProperty({ enum: ['BASICO', 'PREMIUM', 'ENTERPRISE'] })
  @IsIn(['BASICO', 'PREMIUM', 'ENTERPRISE'])
  plan: PlanColegio;
}