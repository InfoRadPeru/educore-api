import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

class BuscarPersonaQuery {
  @IsString() @IsNotEmpty()
  dni: string;
}

export class PersonaEncontradaDto {
  @ApiProperty({ example: 'Juan Carlos' })
  nombres:   string;

  @ApiProperty({ example: 'Pérez García' })
  apellidos: string;

  @ApiProperty({ example: '987654321', nullable: true })
  telefono:  string | null;

  /**
   * Roles en el sistema: puede incluir valores del panel (ej. SUPER_ADMIN, DOCENTE)
   * y perfiles sin usuario (APODERADO, ALUMNO).
   */
  @ApiProperty({ example: ['SUPER_ADMIN', 'DOCENTE'], type: [String] })
  roles:     string[];
}

@ApiTags('Personas')
@Controller('personas')
export class PersonasController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('buscar')
  @Auth()
  @ApiOperation({ summary: 'Buscar persona por DNI — devuelve datos y roles en el sistema' })
  @ApiQuery({ name: 'dni', required: true, example: '12345678' })
  @ApiOkResponse({ type: PersonaEncontradaDto })
  async buscarPorDni(@Query() query: BuscarPersonaQuery): Promise<PersonaEncontradaDto> {
    const persona = await this.prisma.persona.findUnique({
      where:   { dni: query.dni },
      include: {
        usuario:         { include: { asignaciones: { include: { rol: { select: { nombre: true } } } } } },
        perfilesDocente: { select: { id: true } },
        perfilApoderado: { select: { id: true } },
        perfilAlumno:    { select: { id: true } },
      },
    });

    if (!persona) throw new NotFoundException(`No existe una persona con DNI ${query.dni}`);

    const roles: string[] = [];

    // Roles del panel admin (UsuarioAsignacion)
    if (persona.usuario) {
      const rolesAdmin = persona.usuario.asignaciones
        .map(a => a.rol.nombre)
        .filter((v, i, arr) => arr.indexOf(v) === i);
      roles.push(...rolesAdmin);
    }

    // Perfiles sin asignación de panel
    if (persona.perfilesDocente.length > 0 && !roles.includes('DOCENTE'))   roles.push('DOCENTE');
    if (persona.perfilApoderado            && !roles.includes('APODERADO')) roles.push('APODERADO');
    if (persona.perfilAlumno               && !roles.includes('ALUMNO'))    roles.push('ALUMNO');

    return {
      nombres:   persona.nombres,
      apellidos: persona.apellidos,
      telefono:  persona.telefono,
      roles,
    };
  }
}
