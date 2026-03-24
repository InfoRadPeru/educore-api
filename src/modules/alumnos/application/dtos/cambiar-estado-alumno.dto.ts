import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import type { EstadoAlumno } from '../../domain/entities/alumno.entity';

export class CambiarEstadoAlumnoDto {
  @ApiProperty({ enum: ['ACTIVO', 'INACTIVO', 'RETIRADO'] })
  @IsEnum(['ACTIVO', 'INACTIVO', 'RETIRADO'])
  estado: EstadoAlumno;
}
