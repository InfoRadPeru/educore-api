import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional,
  IsString, Min, ValidateIf,
} from 'class-validator';

// ─── Requests ────────────────────────────────────────────────────────────────

export class RegistrarDocenteDto {
  /** DNI del docente (8 dígitos) */
  @ApiProperty({ example: '12345678' })
  @IsString() @IsNotEmpty()
  dni: string;

  @ApiProperty({ example: 'Juan Carlos' })
  @IsString() @IsNotEmpty()
  nombres: string;

  @ApiProperty({ example: 'Pérez García' })
  @IsString() @IsNotEmpty()
  apellidos: string;

  /** Fecha de nacimiento en formato ISO 8601 */
  @ApiProperty({ example: '1985-06-15' })
  @IsString() @IsNotEmpty()
  fechaNac: string;

  @ApiProperty({ enum: ['MASCULINO', 'FEMENINO', 'OTRO'] })
  @IsEnum(['MASCULINO', 'FEMENINO', 'OTRO'])
  genero: 'MASCULINO' | 'FEMENINO' | 'OTRO';

  @ApiPropertyOptional({ example: '987654321' })
  @IsString() @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Matemáticas' })
  @IsString() @IsOptional()
  especialidad?: string;

  /** ID de sede a la que pertenece el docente */
  @ApiPropertyOptional({ example: 'uuid-sede' })
  @IsString() @IsOptional()
  sedeId?: string;

  /** Si es true se crea un usuario con acceso al panel */
  @ApiProperty({ example: false })
  @IsBoolean()
  crearAcceso: boolean;

  /** Requerido cuando crearAcceso es true */
  @ApiPropertyOptional({ example: 'ContraseñaSegura#1' })
  @IsString()
  @ValidateIf(o => o.crearAcceso === true)
  password?: string;
}

export class ActualizarDocenteDto {
  @ApiPropertyOptional({ example: 'Física', nullable: true })
  @IsString() @IsOptional()
  especialidad?: string | null;

  /** ID de sede, o null para quitar la asignación */
  @ApiPropertyOptional({ example: 'uuid-sede', nullable: true })
  @IsString() @IsOptional()
  sedeId?: string | null;
}

export class AsignarSeccionDto {
  @ApiProperty({ example: 'uuid-seccion' })
  @IsString() @IsNotEmpty()
  seccionId: string;

  /** ID de la asignatura registrada en el colegio */
  @ApiProperty({ example: 'uuid-colegio-asignatura' })
  @IsString() @IsNotEmpty()
  colegioAsignaturaId: string;

  @ApiProperty({ example: 2026 })
  @IsNumber() @Min(2020)
  añoAcademico: number;

  /** true si este docente es el tutor de la sección */
  @ApiProperty({ example: false })
  @IsBoolean()
  esTutor: boolean;
}

export class CambiarEstadoDocenteDto {
  @ApiProperty({ enum: ['ACTIVO', 'INACTIVO', 'LICENCIA'] })
  @IsEnum(['ACTIVO', 'INACTIVO', 'LICENCIA'])
  estado: 'ACTIVO' | 'INACTIVO' | 'LICENCIA';
}
