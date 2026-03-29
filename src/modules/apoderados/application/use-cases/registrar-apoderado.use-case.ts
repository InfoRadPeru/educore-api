import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ConflictError } from '@shared/domain/result';
import { APODERADO_REPOSITORY, type ApoderadoRepository } from '../../domain/repositories/apoderado.repository';
import { Apoderado } from '../../domain/entities/apoderado.entity';
import * as bcrypt from 'bcrypt';

export interface RegistrarApoderadoDto {
  colegioId:   string;
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
  ) {}

  async execute(dto: RegistrarApoderadoDto): Promise<Result<RegistrarApoderadoResult, ConflictError>> {
    // 1. ¿Ya existe como apoderado? → error
    const apoderadoExistente = await this.apoderadoRepo.buscarPorDni(dto.dni);
    if (apoderadoExistente) {
      return fail(new ConflictError(`Ya existe un apoderado registrado con DNI ${dto.dni}`));
    }

    // 2a. Sin acceso: solo crear Persona (o vincular) + PerfilApoderado
    if (!dto.crearAcceso) {
      const apoderado = await this.apoderadoRepo.crearConPersona({
        colegioId: dto.colegioId,
        dni:       dto.dni,
        nombres:   dto.nombres,
        apellidos: dto.apellidos,
        telefono:  dto.telefono,
        fechaNac:  dto.fechaNac,
        genero:    dto.genero,
      });
      return ok({ apoderado, passwordGenerado: null });
    }

    // 2b. Con acceso: transacción atómica — Persona + PerfilApoderado + Usuario
    //     Si la persona ya tiene usuario (docente/admin), se vincula sin crear duplicado
    const rawPassword    = dto.password ?? (Math.random().toString(36).slice(-8) + 'A1!');
    const passwordHash   = await bcrypt.hash(rawPassword, 10);
    const { apoderado, usuarioCreado } = await this.apoderadoRepo.crearConPersonaYAcceso({
      colegioId:    dto.colegioId,
      dni:          dto.dni,
      nombres:      dto.nombres,
      apellidos:    dto.apellidos,
      telefono:     dto.telefono,
      fechaNac:     dto.fechaNac,
      genero:       dto.genero,
      passwordHash,
    });

    // Solo devolver el password si fue generado automáticamente y se creó un usuario nuevo
    const passwordGenerado = (!dto.password && usuarioCreado) ? rawPassword : null;
    return ok({ apoderado, passwordGenerado });
  }
}
