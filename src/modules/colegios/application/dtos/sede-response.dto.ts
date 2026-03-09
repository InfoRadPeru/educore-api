// Qué es: DTO de respuesta para una Sede.

import { ApiProperty } from '@nestjs/swagger';

export class SedeResponseDto {
  @ApiProperty() id:        string;
  @ApiProperty() colegioId: string;
  @ApiProperty() nombre:    string;
  @ApiProperty() direccion: string;
  @ApiProperty() telefono:  string | null;
  @ApiProperty() email:     string | null;
  @ApiProperty() activo:    boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}