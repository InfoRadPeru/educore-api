import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;

  // Se usa para replicar el contexto (colegioId, rolId, permisos) sin ir a BD
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  accessToken?: string;
}