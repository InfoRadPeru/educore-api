import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SelectContextDto {

  @ApiProperty({ description: 'ID de la asignación seleccionada' })
  @IsString()
  @IsNotEmpty()
  asignacionId: string;

}