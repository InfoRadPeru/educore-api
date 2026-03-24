import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EstadoPostulacion } from '../../domain/entities/postulacion.entity';
import type { Genero } from '@modules/alumnos/domain/entities/alumno.entity';

export class PostulacionResponseDto {
  @ApiProperty() id:             string;
  @ApiProperty() colegioId:      string;
  @ApiPropertyOptional() sedeId: string | null;
  @ApiProperty() nombres:        string;
  @ApiProperty() apellidos:      string;
  @ApiProperty() dni:            string;
  @ApiProperty() fechaNac:       Date;
  @ApiProperty() genero:         Genero;
  @ApiProperty() colegioNivelId: string;
  @ApiProperty() añoAcademico:   number;
  @ApiProperty() estado:         EstadoPostulacion;
  @ApiPropertyOptional() observaciones:  string | null;
  @ApiPropertyOptional() perfilAlumnoId: string | null;
  @ApiProperty() createdAt:      Date;
  @ApiProperty() updatedAt:      Date;
}
