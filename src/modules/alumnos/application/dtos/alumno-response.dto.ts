import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EstadoAlumno, Genero } from '../../domain/entities/alumno.entity';

export class AlumnoResponseDto {
  @ApiProperty() id:              string;
  @ApiProperty() colegioId:       string;
  @ApiProperty() dni:             string;
  @ApiProperty() nombres:         string;
  @ApiProperty() apellidos:       string;
  @ApiProperty() fechaNac:        Date;
  @ApiProperty() genero:          Genero;
  @ApiPropertyOptional() telefono:  string | null;
  @ApiPropertyOptional() direccion: string | null;
  @ApiProperty() codigoMatricula: string;
  @ApiProperty() estado:          EstadoAlumno;
  @ApiPropertyOptional() colegioOrigenRef: string | null;
  @ApiProperty() createdAt:       Date;
  @ApiProperty() updatedAt:       Date;
}
