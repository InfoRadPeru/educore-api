import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EstadoMatricula } from '../../domain/entities/matricula.entity';

export class MatriculaResponseDto {
  @ApiProperty() id:             string;
  @ApiProperty() perfilAlumnoId: string;
  @ApiProperty() seccionId:      string;
  @ApiProperty() añoAcademico:   number;
  @ApiProperty() estado:         EstadoMatricula;
  @ApiPropertyOptional() observaciones: string | null;
  @ApiProperty() createdAt:      Date;
  @ApiProperty() updatedAt:      Date;
}
