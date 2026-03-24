import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AprobarPrematriculaDto {
  @ApiProperty({ description: 'ID de la sección donde se matriculará el alumno' })
  @IsString()
  seccionId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string;
}
