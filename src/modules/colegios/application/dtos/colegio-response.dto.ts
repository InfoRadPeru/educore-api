// Qué es: DTO de respuesta para datos del colegio.
// Patrón: DTO — separa la representación HTTP de la entidad de dominio.
// Principio SOLID: Single Responsibility — solo define la forma de la respuesta.

import { ApiProperty } from '@nestjs/swagger';

export class ColegioResponseDto {
  @ApiProperty() id:        string;
  @ApiProperty() nombre:    string;
  @ApiProperty() ruc:       string;
  @ApiProperty() direccion: string;
  @ApiProperty() telefono:  string | null;
  @ApiProperty() email:     string;
  @ApiProperty() estado:    string;
  @ApiProperty() plan:      string;
  @ApiProperty() planVenceEn: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}