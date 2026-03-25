import { ApiProperty } from "@nestjs/swagger";

export class RolResponseDto {
    @ApiProperty() id:          string;
    @ApiProperty() colegioId:   string;
    @ApiProperty() nombre:      string;
    @ApiProperty({ nullable: true }) descripcion: string | null;
    @ApiProperty() esSistema:   boolean;
    @ApiProperty({ type: [String] }) permisos: string[];
    @ApiProperty() createdAt:   Date;
    @ApiProperty() updatedAt:   Date;
}
