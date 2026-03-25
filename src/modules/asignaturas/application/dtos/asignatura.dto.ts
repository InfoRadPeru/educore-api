import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CrearAsignaturaMaestraDto {
  @ApiProperty({ example: 'Matemáticas' })
  @IsString() @MinLength(2)
  nombre: string;

  @ApiPropertyOptional({ example: 'Álgebra, geometría y aritmética' })
  @IsString() @IsOptional()
  descripcion?: string;
}

export class ActualizarAsignaturaMaestraDto {
  @ApiPropertyOptional({ example: 'Matemáticas' })
  @IsString() @MinLength(2) @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  descripcion?: string | null;
}

export class CambiarEstadoAsignaturaDto {
  @ApiProperty()
  @IsBoolean()
  activo: boolean;
}

export class ActivarAsignaturaColegioDto {
  @ApiProperty({ example: 'uuid-de-asignatura-maestra' })
  @IsUUID()
  asignaturaMaestraId: string;
}

export class RenombrarAsignaturaColegioDto {
  @ApiPropertyOptional({ example: 'Matemáticas Avanzadas', nullable: true })
  @IsOptional()
  nombre: string | null;
}

export class AsignarAsignaturaGradoDto {
  @ApiProperty({ example: 'uuid-de-colegio-asignatura' })
  @IsUUID()
  colegioAsignaturaId: string;

  @ApiPropertyOptional({ example: 4 })
  @IsInt() @Min(1) @IsOptional()
  horasSemanales?: number;
}

export class ActualizarHorasGradoDto {
  @ApiPropertyOptional({ example: 4, nullable: true })
  @IsOptional()
  horasSemanales: number | null;
}
