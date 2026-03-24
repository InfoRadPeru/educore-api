import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ConflictError } from '@shared/domain/result';
import { APODERADO_REPOSITORY, type ApoderadoRepository } from '../../domain/repositories/apoderado.repository';
import { USUARIO_REPOSITORY, type UsuarioRepository } from '@modules/auth/domain/repositories/usuario.repository';
import { Apoderado } from '../../domain/entities/apoderado.entity';
import * as bcrypt from 'bcrypt';

export interface RegistrarApoderadoDto {
  dni:         string;
  nombres:     string;
  apellidos:   string;
  telefono?:   string;
  fechaNac:    Date;
  genero:      'MASCULINO' | 'FEMENINO' | 'OTRO';
  crearAcceso: boolean;
  password?:   string;
}

export interface RegistrarApoderadoResult {
  apoderado:        Apoderado;
  passwordGenerado: string | null;
}

@Injectable()
export class RegistrarApoderadoUseCase {
  constructor(
    @Inject(APODERADO_REPOSITORY)
    private readonly apoderadoRepo: ApoderadoRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepo: UsuarioRepository,
  ) {}

  async execute(dto: RegistrarApoderadoDto): Promise<Result<RegistrarApoderadoResult, ConflictError>> {
    // Verificar si ya existe un apoderado con ese DNI
    const apoderadoExistente = await this.apoderadoRepo.buscarPorDni(dto.dni);
    if (apoderadoExistente) {
      return fail(new ConflictError(`Ya existe un apoderado con DNI ${dto.dni}`));
    }

    // Crear Persona + PerfilApoderado
    const apoderado = await this.apoderadoRepo.crearConPersona({
      dni:       dto.dni,
      nombres:   dto.nombres,
      apellidos: dto.apellidos,
      telefono:  dto.telefono,
      fechaNac:  dto.fechaNac,
      genero:    dto.genero,
    });

    // Crear acceso al portal si se solicita
    let passwordGenerado: string | null = null;
    if (dto.crearAcceso) {
      const rawPassword = dto.password ?? (Math.random().toString(36).slice(-8) + 'A1!');
      if (!dto.password) passwordGenerado = rawPassword;
      const hash = await bcrypt.hash(rawPassword, 10);
      await this.usuarioRepo.crearParaPersona({
        personaId:    apoderado.personaId,
        username:     dto.dni,
        email:        `${dto.dni}@apoderado.local`,
        passwordHash: hash,
      });
    }

    return ok({ apoderado, passwordGenerado });
  }
}
