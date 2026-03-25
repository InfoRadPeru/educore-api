import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsUUID, IsPositive } from 'class-validator';

// ─── Query params ──────────────────────────────────────────────────────────────

export class BoletinQueryDto {
  @ApiProperty({ example: 2026 })
  @IsInt() @IsPositive()
  año: number;
}

export class PublicarBoletinDto {
  @ApiProperty()
  @IsUUID()
  periodoId: string;

  @ApiProperty()
  @IsUUID()
  seccionId: string;
}

// ─── Response shapes ───────────────────────────────────────────────────────────

export class AsistenciaResumenDto {
  @ApiProperty() total:       number;
  @ApiProperty() presentes:   number;
  @ApiProperty() ausentes:    number;
  @ApiProperty() tardanzas:   number;
  @ApiProperty() justificados: number;
}

export class AsignaturaBoletinDto {
  @ApiProperty() asignaturaId:   string;
  @ApiProperty() nombre:         string;
  @ApiPropertyOptional() notaFinal: number | null;
  @ApiProperty() asistencias:    AsistenciaResumenDto;
}

export class PeriodoBoletinDto {
  @ApiProperty() periodoId:   string;
  @ApiProperty() nombre:      string;
  @ApiProperty() numero:      number;
  @ApiProperty() fechaInicio: string;
  @ApiProperty() fechaFin:    string;
  @ApiProperty({ type: [AsignaturaBoletinDto] }) asignaturas: AsignaturaBoletinDto[];
  @ApiPropertyOptional() promedio: number | null;
}

export class AlumnoInfoDto {
  @ApiProperty() id:              string;
  @ApiProperty() nombres:         string;
  @ApiProperty() apellidos:       string;
  @ApiProperty() codigoMatricula: string;
  @ApiProperty() seccion:         string;
  @ApiProperty() grado:           string;
  @ApiProperty() nivel:           string;
}

export class BoletinResponseDto {
  @ApiProperty() alumno:        AlumnoInfoDto;
  @ApiProperty() año:           number;
  @ApiProperty({ type: [PeriodoBoletinDto] }) periodos: PeriodoBoletinDto[];
  @ApiPropertyOptional() promedioAnual: number | null;
}

export class PublicacionResponseDto {
  @ApiProperty() id:            string;
  @ApiProperty() periodoId:     string;
  @ApiProperty() seccionId:     string;
  @ApiProperty() publicadoEn:   string;
  @ApiProperty() publicadoPorId: string;
}
