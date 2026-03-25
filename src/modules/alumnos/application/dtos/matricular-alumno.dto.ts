import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class MatricularAlumnoDto {
  @ApiProperty({ description: 'ID de la sección' })
  @IsString()
  seccionId: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2020)
  añoAcademico: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string;
}
