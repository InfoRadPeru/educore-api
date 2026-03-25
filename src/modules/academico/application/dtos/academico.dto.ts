import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional,
  IsPositive, IsString, IsUUID, Min, MinLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Periodos ─────────────────────────────────────────────────────────────────

export class CrearPeriodoDto {
  @ApiProperty({ example: 2026 })
  @IsInt() @IsPositive()
  añoAcademico: number;

  @ApiProperty({ example: '1er Bimestre' })
  @IsString() @MinLength(2)
  nombre: string;

  @ApiProperty({ example: 1 })
  @IsInt() @Min(1)
  numero: number;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ example: '2026-05-31' })
  @IsDateString()
  fechaFin: string;
}

export class ActualizarPeriodoDto {
  @ApiPropertyOptional({ example: '1er Bimestre (ajustado)' })
  @IsString() @MinLength(2) @IsOptional()
  nombre?: string;

  @ApiPropertyOptional()
  @IsDateString() @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional()
  @IsDateString() @IsOptional()
  fechaFin?: string;
}

export class CambiarEstadoDto {
  @ApiProperty()
  @IsBoolean()
  activo: boolean;
}

// ─── Categorías ───────────────────────────────────────────────────────────────

export class CrearCategoriaDto {
  @ApiProperty({ example: 'uuid-docente-asignacion' })
  @IsUUID()
  docenteAsignacionId: string;

  @ApiProperty({ example: 'Exámenes' })
  @IsString() @MinLength(2)
  nombre: string;

  @ApiProperty({ example: 40, description: 'Peso en % (suma por asignación debe ser ≤ 100)' })
  @IsNumber() @Min(1)
  peso: number;

  @ApiProperty({ example: 1 })
  @IsInt() @Min(1)
  orden: number;
}

export class ActualizarCategoriaDto {
  @ApiPropertyOptional({ example: 'Exámenes escritos' })
  @IsString() @MinLength(2) @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 40 })
  @IsNumber() @Min(1) @IsOptional()
  peso?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt() @Min(1) @IsOptional()
  orden?: number;
}

// ─── Actividades ──────────────────────────────────────────────────────────────

export class CrearActividadDto {
  @ApiProperty()
  @IsUUID()
  docenteAsignacionId: string;

  @ApiProperty()
  @IsUUID()
  periodoId: string;

  @ApiProperty()
  @IsUUID()
  categoriaId: string;

  @ApiProperty({ example: 'Examen Parcial' })
  @IsString() @MinLength(2)
  titulo: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsDateString() @IsOptional()
  fechaLimite?: string;

  @ApiProperty({ example: 20 })
  @IsNumber() @IsPositive()
  puntajeMaximo: number;

  @ApiProperty({ example: 2, description: 'Peso relativo dentro de su categoría' })
  @IsNumber() @IsPositive()
  pesoEnCategoria: number;
}

export class ActualizarActividadDto {
  @ApiPropertyOptional()
  @IsString() @MinLength(2) @IsOptional()
  titulo?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  descripcion?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  fechaLimite?: string | null;

  @ApiPropertyOptional()
  @IsNumber() @IsPositive() @IsOptional()
  puntajeMaximo?: number;

  @ApiPropertyOptional()
  @IsNumber() @IsPositive() @IsOptional()
  pesoEnCategoria?: number;
}

// ─── Notas ────────────────────────────────────────────────────────────────────

export class RegistrarNotaDto {
  @ApiProperty()
  @IsUUID()
  alumnoId: string;

  @ApiPropertyOptional({ nullable: true })
  @IsNumber() @Min(0) @IsOptional()
  puntaje?: number | null;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  observacion?: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  motivo?: string;
}

export class NotaBulkItem {
  @ApiProperty()
  @IsUUID()
  alumnoId: string;

  @ApiPropertyOptional({ nullable: true })
  @IsNumber() @Min(0) @IsOptional()
  puntaje?: number | null;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  observacion?: string;
}

export class RegistrarNotasBulkDto {
  @ApiProperty({ type: [NotaBulkItem] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => NotaBulkItem)
  notas: NotaBulkItem[];
}

// ─── Asistencias ──────────────────────────────────────────────────────────────

export class AsistenciaItem {
  @ApiProperty()
  @IsUUID()
  alumnoId: string;

  @ApiProperty({ enum: ['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO'] })
  @IsString()
  estado: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  observacion?: string;
}

export class RegistrarAsistenciaClaseDto {
  @ApiProperty()
  @IsUUID()
  docenteAsignacionId: string;

  @ApiProperty({ example: '2026-03-22' })
  @IsDateString()
  fecha: string;

  @ApiProperty({ type: [AsistenciaItem] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => AsistenciaItem)
  registros: AsistenciaItem[];
}

export class CorregirAsistenciaDto {
  @ApiProperty({ enum: ['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO'] })
  @IsString()
  estado: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  observacion?: string;
}
