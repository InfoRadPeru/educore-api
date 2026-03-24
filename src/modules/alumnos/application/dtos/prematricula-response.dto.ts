import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EstadoPrematricula } from '../../domain/entities/prematricula.entity';

export class PrematriculaResponseDto {
  @ApiProperty() id:             string;
  @ApiProperty() colegioId:      string;
  @ApiProperty() alumnoId:       string;
  @ApiProperty() colegioNivelId: string;
  @ApiPropertyOptional() seccionId:    string | null;
  @ApiProperty() añoAcademico:   number;
  @ApiProperty() estado:         EstadoPrematricula;
  @ApiPropertyOptional() observaciones: string | null;
  @ApiPropertyOptional() matriculaId:   string | null;
  @ApiProperty() createdAt:      Date;
  @ApiProperty() updatedAt:      Date;
}
