import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsPositive,
  IsString, IsUUID, Max, Min, MinLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const TIPOS   = ['MATRICULA', 'PENSION', 'OTRO']               as const;
const METODOS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'DEPOSITO'] as const;

// ─── Conceptos ────────────────────────────────────────────────────────────────

export class CrearConceptoDto {
  @ApiProperty({ example: 'Pensión mensual' })
  @IsString() @MinLength(2)
  nombre: string;

  @ApiProperty({ enum: TIPOS })
  @IsEnum(TIPOS)
  tipo: string;
}

export class ActualizarConceptoDto {
  @ApiPropertyOptional()
  @IsString() @MinLength(2) @IsOptional()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  activo?: boolean;
}

// ─── Tarifas ──────────────────────────────────────────────────────────────────

export class ConfigurarTarifaDto {
  @ApiProperty()
  @IsUUID()
  conceptoPagoId: string;

  @ApiProperty({ example: 2026 })
  @IsInt() @IsPositive()
  añoAcademico: number;

  @ApiPropertyOptional({ description: 'null = aplica a todos los niveles' })
  @IsUUID() @IsOptional()
  colegioNivelId?: string;

  @ApiProperty({ example: 350.00 })
  @IsNumber() @IsPositive()
  monto: number;
}

// ─── Cuotas ───────────────────────────────────────────────────────────────────

export class GenerarCuotasDto {
  @ApiProperty({ example: 2026 })
  @IsInt() @IsPositive()
  añoAcademico: number;

  @ApiPropertyOptional({ description: 'Meses a generar pensiones (1-12). Default: [3..12]', type: [Number] })
  @IsArray() @IsInt({ each: true }) @Min(1, { each: true }) @Max(12, { each: true }) @IsOptional()
  mesesPension?: number[];

  @ApiPropertyOptional({ description: 'Día del mes para vencimiento. Default: 15' })
  @IsInt() @Min(1) @Max(28) @IsOptional()
  diaVencimiento?: number;
}

export class GenerarCuotasMasivoDto {
  @ApiProperty({ example: 2026 })
  @IsInt() @IsPositive()
  añoAcademico: number;

  @ApiPropertyOptional({ type: [Number] })
  @IsArray() @IsInt({ each: true }) @IsOptional()
  mesesPension?: number[];

  @ApiPropertyOptional()
  @IsInt() @Min(1) @Max(28) @IsOptional()
  diaVencimiento?: number;
}

// ─── Pagos ────────────────────────────────────────────────────────────────────

export class PagoItemDto {
  @ApiProperty()
  @IsUUID()
  cuotaId: string;

  @ApiProperty({ example: 350.00 })
  @IsNumber() @IsPositive()
  monto: number;
}

export class RegistrarPagoDto {
  @ApiProperty({ enum: METODOS })
  @IsEnum(METODOS)
  metodoPago: string;

  @ApiPropertyOptional({ example: 'OP-20260315-001' })
  @IsString() @IsOptional()
  referencia?: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  observacion?: string;

  @ApiProperty({ type: [PagoItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => PagoItemDto)
  pagos: PagoItemDto[];
}

export class AnularPagoDto {
  @ApiProperty()
  @IsString() @MinLength(5)
  motivo: string;
}
