import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class ActualizarRolDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(100)
    nombre?: string;

    @ApiPropertyOptional({ nullable: true })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    descripcion?: string | null;
}
