import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CambiarEstadoMatriculaDto {
  @ApiProperty({ enum: ['NUEVA_MATRICULA', 'MATRICULADO', 'REPITENTE', 'PROMOVIDO', 'EXPULSADO', 'CAMBIO_DE_COLEGIO'] })
  @IsEnum(['NUEVA_MATRICULA', 'MATRICULADO', 'REPITENTE', 'PROMOVIDO', 'EXPULSADO', 'CAMBIO_DE_COLEGIO'])
  estado: 'NUEVA_MATRICULA' | 'MATRICULADO' | 'REPITENTE' | 'PROMOVIDO' | 'EXPULSADO' | 'CAMBIO_DE_COLEGIO';

  @ApiPropertyOptional() @IsString() @IsOptional()
  observaciones?: string;
}
