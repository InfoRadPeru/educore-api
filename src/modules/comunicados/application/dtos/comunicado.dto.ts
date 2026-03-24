import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum, IsInt, IsOptional, IsPositive, IsString, IsUUID, MinLength,
} from 'class-validator';

const AUDIENCIAS = ['COLEGIO', 'NIVEL', 'GRADO', 'SECCION', 'INDIVIDUAL'] as const;

export class CrearComunicadoDto {
  @ApiProperty({ example: 'Reunión de padres de familia' })
  @IsString() @MinLength(3)
  titulo: string;

  @ApiProperty({ example: 'Se convoca a todos los padres...' })
  @IsString() @MinLength(1)
  contenido: string;

  @ApiProperty({ enum: AUDIENCIAS })
  @IsEnum(AUDIENCIAS)
  audiencia: string;

  @ApiPropertyOptional({ description: 'Requerido si audiencia=NIVEL' })
  @IsUUID() @IsOptional()
  colegioNivelId?: string;

  @ApiPropertyOptional({ description: 'Requerido si audiencia=GRADO' })
  @IsUUID() @IsOptional()
  colegioGradoId?: string;

  @ApiPropertyOptional({ description: 'Requerido si audiencia=SECCION' })
  @IsUUID() @IsOptional()
  seccionId?: string;

  @ApiPropertyOptional({ description: 'Requerido si audiencia=INDIVIDUAL (perfilApoderadoId)' })
  @IsUUID() @IsOptional()
  destinatarioId?: string;

  @ApiProperty({ example: 2026 })
  @IsInt() @IsPositive()
  añoAcademico: number;
}

export class ActualizarComunicadoDto {
  @ApiPropertyOptional()
  @IsString() @MinLength(3) @IsOptional()
  titulo?: string;

  @ApiPropertyOptional()
  @IsString() @MinLength(1) @IsOptional()
  contenido?: string;

  @ApiPropertyOptional({ enum: AUDIENCIAS })
  @IsEnum(AUDIENCIAS) @IsOptional()
  audiencia?: string;

  @ApiPropertyOptional()
  @IsUUID() @IsOptional()
  colegioNivelId?: string;

  @ApiPropertyOptional()
  @IsUUID() @IsOptional()
  colegioGradoId?: string;

  @ApiPropertyOptional()
  @IsUUID() @IsOptional()
  seccionId?: string;

  @ApiPropertyOptional()
  @IsUUID() @IsOptional()
  destinatarioId?: string;
}
