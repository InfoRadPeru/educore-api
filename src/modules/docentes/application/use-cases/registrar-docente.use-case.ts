import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ConflictError } from '@shared/domain/result';
import { DOCENTE_REPOSITORY, type DocenteRepository } from '../../domain/repositories/docente.repository';
import { USUARIO_REPOSITORY, type UsuarioRepository } from '@modules/auth/domain/repositories/usuario.repository';
import { Docente } from '../../domain/entities/docente.entity';
import * as bcrypt from 'bcrypt';

export interface RegistrarDocenteDto {
  dni:          string;
  nombres:      string;
  apellidos:    string;
  telefono?:    string;
  fechaNac:     Date;
  genero:       'MASCULINO' | 'FEMENINO' | 'OTRO';
  especialidad?: string;
  sedeId?:      string;
  crearAcceso:  boolean;
  password?:    string;
}

export interface RegistrarDocenteResult {
  docente:          Docente;
  passwordGenerado: string | null;
}

@Injectable()
export class RegistrarDocenteUseCase {
  constructor(
    @Inject(DOCENTE_REPOSITORY)
    private readonly docenteRepo: DocenteRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepo: UsuarioRepository,
  ) {}

  async execute(
    colegioId: string,
    dto: RegistrarDocenteDto,
  ): Promise<Result<RegistrarDocenteResult, ConflictError>> {
    // Verificar si ya tiene perfil docente en este colegio
    const existente = await this.docenteRepo.buscarPorDni(dto.dni, colegioId);
    if (existente) {
      return fail(new ConflictError(`Ya existe un docente con DNI ${dto.dni} en este colegio`));
    }

    const docente = await this.docenteRepo.crearConPersona({
      dni:          dto.dni,
      nombres:      dto.nombres,
      apellidos:    dto.apellidos,
      telefono:     dto.telefono,
      fechaNac:     dto.fechaNac,
      genero:       dto.genero,
      colegioId,
      sedeId:       dto.sedeId,
      especialidad: dto.especialidad,
    });

    let passwordGenerado: string | null = null;
    let usuarioId = docente.usuarioId;

    if (dto.crearAcceso && !usuarioId) {
      const rawPassword = dto.password ?? (Math.random().toString(36).slice(-8) + 'A1!');
      if (!dto.password) passwordGenerado = rawPassword;
      const hash = await bcrypt.hash(rawPassword, 10);
      const usuario = await this.usuarioRepo.crearParaPersona({
        personaId:    docente.personaId,
        username:     dto.dni,
        email:        `${dto.dni}@docente.local`,
        passwordHash: hash,
      });
      usuarioId = usuario.id;
    }

    // Si la persona ya tenía usuario (ej: también es SUPER_ADMIN) o se acaba de crear,
    // crear la UsuarioAsignacion con rol DOCENTE para que aparezca en multi-context login
    if (usuarioId) {
      await this.docenteRepo.crearAsignacionUsuario(usuarioId, colegioId);
    }

    return ok({ docente, passwordGenerado });
  }
}
