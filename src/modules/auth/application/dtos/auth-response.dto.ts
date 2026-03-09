import { ApiProperty } from "@nestjs/swagger";

export class UsuarioResponseDto {
  @ApiProperty() id:       string;
  @ApiProperty() email:    string;
  @ApiProperty() nombres:  string;
  @ApiProperty() apellidos: string;
}

export class AuthResponseDto {
  @ApiProperty() accessToken:  string;
  @ApiProperty() refreshToken: string;
  @ApiProperty({ type: UsuarioResponseDto }) usuario: UsuarioResponseDto;
  @ApiProperty() colegioId:    string;
  @ApiProperty() sedeId:       string | null;
  @ApiProperty() rolId:        string;
  @ApiProperty() rolNombre:    string;
  @ApiProperty() esSistema:    boolean;
  @ApiProperty({ type: [String] }) permisos: string[];
}

export class AsignacionOpcionDto {
  @ApiProperty() id:            string;
  @ApiProperty() colegioId:     string;
  @ApiProperty() colegioNombre: string;
  @ApiProperty() sedeId:        string | null;
  @ApiProperty() sedeNombre:    string | null;
  @ApiProperty() rolNombre:     string;
}

export class MultiContextResponseDto {
  @ApiProperty() requiereSeleccion: boolean;
  @ApiProperty() tempToken:         string;
  @ApiProperty({ type: [AsignacionOpcionDto] }) asignaciones: AsignacionOpcionDto[];
}