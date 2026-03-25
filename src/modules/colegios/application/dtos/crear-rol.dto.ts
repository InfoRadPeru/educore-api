import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, MaxLength } from "class-validator";

export class CrearRolDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    nombre: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(255)
    descripcion?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permisos?: string[];
}
