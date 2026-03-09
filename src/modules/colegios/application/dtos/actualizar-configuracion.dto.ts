// Qué es: DTO de entrada para editar la configuración del colegio.

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarConfiguracionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(7)
  colorPrimario?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(7)
  colorSecundario?: string;

  @ApiPropertyOptional({ enum: ['BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL'] })
  @IsOptional()
  @IsIn(['BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL'])
  periodo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zonaHoraria?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(3)
  moneda?: string;
}