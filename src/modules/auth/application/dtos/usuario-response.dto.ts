import { ApiProperty } from "@nestjs/swagger";
import { Rol } from "@prisma/client";

export class UsuarioResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Rol })
  rol: Rol;
}