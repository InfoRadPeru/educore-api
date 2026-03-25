import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { EstadoMatricula } from '../../domain/entities/matricula.entity';

export class CambiarEstadoMatriculaDto {
  @ApiProperty({ enum: ['NUEVA_MATRICULA', 'MATRICULADO', 'REPITENTE', 'PROMOVIDO', 'EXPULSADO', 'CAMBIO_DE_COLEGIO'] })
  @IsEnum(['NUEVA_MATRICULA', 'MATRICULADO', 'REPITENTE', 'PROMOVIDO', 'EXPULSADO', 'CAMBIO_DE_COLEGIO'])
  estado: EstadoMatricula;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string;
}
