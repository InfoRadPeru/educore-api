// Qué es: DTO de entrada para crear una sede.

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearSedeDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  direccion: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}