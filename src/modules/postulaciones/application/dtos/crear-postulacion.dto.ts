import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CrearPostulacionDto {
  @ApiPropertyOptional()
  @IsString() @IsOptional()
  sedeId?: string;

  @ApiProperty() @IsString() @MaxLength(100)
  nombres: string;

  @ApiProperty() @IsString() @MaxLength(100)
  apellidos: string;

  @ApiProperty() @IsString() @MaxLength(20)
  dni: string;

  @ApiProperty({ example: '2010-05-15' })
  @IsDateString()
  fechaNac: string;

  @ApiProperty({ enum: ['MASCULINO', 'FEMENINO', 'OTRO'] })
  @IsEnum(['MASCULINO', 'FEMENINO', 'OTRO'])
  genero: 'MASCULINO' | 'FEMENINO' | 'OTRO';

  @ApiProperty({ description: 'ID del ColegioNivel al que postula' })
  @IsString()
  colegioNivelId: string;

  @ApiProperty({ example: 2026 }) @IsInt() @Min(2020)
  añoAcademico: number;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500)
  observaciones?: string;
}
