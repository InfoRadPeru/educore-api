import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean, IsEnum, IsInt, IsOptional, IsPositive, IsString, Matches, Min, MinLength,
} from 'class-validator';

const DIAS = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'] as const;
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// ─── Franjas ──────────────────────────────────────────────────────────────────

export class CrearFranjaDto {
  @ApiProperty({ example: '1er Período' })
  @IsString() @MinLength(2)
  nombre: string;

  @ApiProperty({ example: '08:00' })
  @IsString() @Matches(HORA_REGEX, { message: 'horaInicio debe tener formato HH:MM' })
  horaInicio: string;

  @ApiProperty({ example: '09:00' })
  @IsString() @Matches(HORA_REGEX, { message: 'horaFin debe tener formato HH:MM' })
  horaFin: string;

  @ApiProperty({ example: 1 })
  @IsInt() @Min(1)
  orden: number;
}

export class ActualizarFranjaDto {
  @ApiPropertyOptional()
  @IsString() @MinLength(2) @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsString() @Matches(HORA_REGEX, { message: 'horaInicio debe tener formato HH:MM' }) @IsOptional()
  horaInicio?: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsString() @Matches(HORA_REGEX, { message: 'horaFin debe tener formato HH:MM' }) @IsOptional()
  horaFin?: string;

  @ApiPropertyOptional()
  @IsInt() @Min(1) @IsOptional()
  orden?: number;

  @ApiPropertyOptional()
  @IsBoolean() @IsOptional()
  activo?: boolean;
}

// ─── Horario ──────────────────────────────────────────────────────────────────

export class CrearHorarioDto {
  @ApiProperty({ example: 2026 })
  @IsInt() @IsPositive()
  añoAcademico: number;
}

export class GenerarHorarioDto {
  @ApiProperty({ example: 2026 })
  @IsInt() @IsPositive()
  añoAcademico: number;

  @ApiPropertyOptional({ description: 'true = elimina borrador existente y regenera' })
  @IsBoolean() @IsOptional()
  sobreescribir?: boolean;
}

export class GenerarHorarioColegioDto {
  @ApiProperty({ example: 2026 })
  @IsInt() @IsPositive()
  añoAcademico: number;

  @ApiPropertyOptional()
  @IsBoolean() @IsOptional()
  sobreescribir?: boolean;
}

// ─── Bloques ──────────────────────────────────────────────────────────────────

export class AgregarBloqueDto {
  @ApiProperty()
  @IsString()
  docenteAsignacionId: string;

  @ApiProperty()
  @IsString()
  franjaHorariaId: string;

  @ApiProperty({ enum: DIAS })
  @IsEnum(DIAS)
  diaSemana: string;

  @ApiPropertyOptional({ example: 'Aula 3A' })
  @IsString() @IsOptional()
  aula?: string;
}

export class ActualizarBloqueDto {
  @ApiPropertyOptional()
  @IsString() @IsOptional()
  docenteAsignacionId?: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  franjaHorariaId?: string;

  @ApiPropertyOptional({ enum: DIAS })
  @IsEnum(DIAS) @IsOptional()
  diaSemana?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  aula?: string | null;
}
