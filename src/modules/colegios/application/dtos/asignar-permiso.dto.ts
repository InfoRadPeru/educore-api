import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class AsignarPermisoDto {
    @ApiProperty()
    @IsString()
    permiso: string;
}

export class ActualizarPermisosDto {
    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permisos: string[];
}
