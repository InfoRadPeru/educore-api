import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegistrarAlumnoDto {
  @ApiProperty()
  @IsString()
  @MaxLength(20)
  dni: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  nombres: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  apellidos: string;

  @ApiProperty({ example: '2010-05-15' })
  @IsDateString()
  fechaNac: string;

  @ApiProperty({ enum: ['MASCULINO', 'FEMENINO', 'OTRO'] })
  @IsEnum(['MASCULINO', 'FEMENINO', 'OTRO'])
  genero: 'MASCULINO' | 'FEMENINO' | 'OTRO';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  direccion?: string;

  @ApiPropertyOptional({ description: 'Nombre del colegio de procedencia' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  colegioOrigenRef?: string;
}
