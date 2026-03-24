import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: '12345678', description: 'DNI o nombre de usuario' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(6, { message: 'Mínimo 6 caracteres' })
  password: string;
}
