import { ApiProperty } from "@nestjs/swagger";
import { Rol } from "@prisma/client";

export class ContextoActualDto {
  @ApiProperty() colegioId:     string;
  @ApiProperty() colegioNombre: string;
  @ApiProperty() sedeId:        string | null;
  @ApiProperty() sedeNombre:    string | null;
  @ApiProperty() rolNombre:     string;
  @ApiProperty() esSistema:     boolean;
  @ApiProperty({ type: [String] }) permisos: string[];
}

export class MeResponseDto {
  @ApiProperty() id:           string;
  @ApiProperty() email:        string;
  @ApiProperty() nombres:      string;
  @ApiProperty() apellidos:    string;
  @ApiProperty() ultimoAcceso: Date | null;
  @ApiProperty({ type: ContextoActualDto, nullable: true })
  contextoActual: ContextoActualDto | null;
}