import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: 'admin@colegio.pe' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @ApiProperty({ example: 'Pérez García' })
  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  dni: string;

  @ApiProperty({ example: '999888777', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: 'Colegio San Marcos' })
  @IsString()
  @IsNotEmpty()
  colegioNombre: string;

  @ApiProperty({ example: '20123456789' })
  @IsString()
  @IsNotEmpty()
  colegioRuc: string;

  @ApiProperty({ example: 'Av. Principal 123, Lima' })
  @IsString()
  @IsNotEmpty()
  colegioDireccion: string;

  @ApiProperty({ example: 'contacto@colegio.pe' })
  @IsEmail()
  colegioEmail: string;
}