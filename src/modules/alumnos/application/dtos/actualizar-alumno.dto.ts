import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarAlumnoDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombres?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  apellidos?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  fechaNac?: string;

  @ApiPropertyOptional({ enum: ['MASCULINO', 'FEMENINO', 'OTRO'] })
  @IsEnum(['MASCULINO', 'FEMENINO', 'OTRO'])
  @IsOptional()
  genero?: 'MASCULINO' | 'FEMENINO' | 'OTRO';

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  telefono?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  direccion?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  colegioOrigenRef?: string | null;
}
