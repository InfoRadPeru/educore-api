import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CrearPrematriculaDto {
  @ApiProperty({ description: 'ID del alumno existente' })
  @IsString()
  alumnoId: string;

  @ApiProperty({ description: 'ID del ColegioNivel al que se pre-matricula' })
  @IsString()
  colegioNivelId: string;

  @ApiPropertyOptional({ description: 'Sección tentativa (puede asignarse al confirmar)' })
  @IsString() @IsOptional()
  seccionId?: string;

  @ApiProperty({ example: 2026 }) @IsInt() @Min(2020)
  añoAcademico: number;

  @ApiPropertyOptional() @IsString() @IsOptional()
  observaciones?: string;
}
