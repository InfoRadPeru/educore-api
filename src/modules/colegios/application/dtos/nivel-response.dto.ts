import { ApiProperty } from '@nestjs/swagger';

export class NivelResponseDto {
  @ApiProperty()                          tipo:           'disponible' | 'activado';
  @ApiProperty({ required: false })       id?:            string;
  @ApiProperty()                          nivelMaestroId: string;
  @ApiProperty()                          nombre:         string;
  @ApiProperty()                          orden:          number;
  @ApiProperty({ required: false })       activo?:        boolean;
  @ApiProperty({ required: false })       turnos?:        string[];
}