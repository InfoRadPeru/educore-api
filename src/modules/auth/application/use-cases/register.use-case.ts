// Qué es: Caso de uso de registro.
// Principio SOLID: Single Responsibility, Dependency Inversion.

import { USUARIO_REPOSITORY, type UsuarioRepository } from "@modules/auth/domain/repositories/usuario.repository";
import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConflictError, ok, Result, ValidationError } from "@shared/domain/result";
import { Email } from "@modules/auth/domain/value-objects/email.vo";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from "../dtos/register.dto";
import { AuthResponseDto } from "../dtos/auth-response.dto";
import { REFRESH_TOKEN_REPOSITORY, type RefreshTokenRepository } from "@modules/auth/domain/repositories/refresh-token.repository";
import { COLEGIO_REPOSITORY, type ColegioRepository } from "@modules/auth/domain/repositories/colegio.repository";

const SALT_ROUNDS = 12;

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RegisterDto): Promise<Result<AuthResponseDto, ConflictError | ValidationError>> {
    const emailResult = Email.create(dto.email);
    if (!emailResult.ok) return fail(new ValidationError('Email inválido'));

    const existe = await this.usuarioRepository.existsByEmail(emailResult.value);
    if (existe) return fail(new ConflictError(`El email '${emailResult.value.value}' ya está registrado`));

    const colegioExiste = await this.colegioRepository.existsByRuc(dto.colegioRuc);
    if (colegioExiste) return fail(new ConflictError('Ya existe un colegio con ese RUC'));

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const usuario = await this.usuarioRepository.create({
      email:     emailResult.value,
      passwordHash,
      nombres:   dto.nombres,
      apellidos: dto.apellidos,
      telefono:  dto.telefono,
    });

    const { asignacion } = await this.colegioRepository.crearColegioConSuperAdmin({
      nombre:    dto.colegioNombre,
      ruc:       dto.colegioRuc,
      direccion: dto.colegioDireccion,
      email:     dto.colegioEmail,
      usuarioId: usuario.id,
    });

    const accessToken = this.jwtService.sign({
      sub:       usuario.id,
      email:     usuario.email.value,
      colegioId: asignacion.colegioId,
      sedeId:    null,
      rolId:     asignacion.rolId,
      esSistema: true,
      permisos:  [],
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    await this.refreshTokenRepository.create({
      token:     refreshToken,
      usuarioId: usuario.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return ok({
      accessToken,
      refreshToken,
      usuario:   { id: usuario.id, email: usuario.email.value, nombres: usuario.nombres, apellidos: usuario.apellidos },
      colegioId: asignacion.colegioId,
      sedeId:    null,
      rolId:     asignacion.rolId,
      rolNombre: 'SUPER_ADMIN',
      esSistema: true,
      permisos:  [],
    });
  }
}