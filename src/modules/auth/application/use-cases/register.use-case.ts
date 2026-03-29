// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Caso de uso de registro. Orquesta la creación de un nuevo
//   SUPER_ADMIN junto con su colegio inicial.
//
// FLUJO:
//   1. Validar email
//   2. Verificar que el email no esté en uso
//   3. Verificar que el RUC no esté en uso
//   4. Crear el usuario (hash de contraseña)
//   5. Crear colegio + rol + asignación (vía OnboardingPort)
//   6. Generar JWT con el contexto del colegio recién creado
//   7. Generar y persistir refresh token
//
// PRINCIPIO SOLID:
//   Single Responsibility: solo orquesta el flujo de registro.
//   Dependency Inversion: depende de interfaces (ports/repositories),
//   nunca de implementaciones concretas (Prisma, bcrypt directo en dominio).
//
// POR QUÉ ONBOARDING_PORT Y NO COLEGIO_REPOSITORY:
//   Auth no es dueño del dominio Colegios. Solo necesita una
//   capacidad específica durante el registro. El Port define
//   exactamente esa capacidad y nada más.
//
// CONSTANTE SALT_ROUNDS:
//   Definida aquí y usada directamente. Si se necesita compartir
//   entre use cases, moverla a shared/domain/constants.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { Email } from '@modules/auth/domain/value-objects/email.vo';
import { USUARIO_REPOSITORY, type UsuarioRepository } from '@modules/auth/domain/repositories/usuario.repository';
import { REFRESH_TOKEN_REPOSITORY, type RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { ONBOARDING_PORT, type OnboardingPort } from '@modules/auth/domain/ports/onboarding.port';


import { RegisterDto } from '../dtos/register.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { ConflictError, fail, ok, Result, ValidationError } from '@shared/domain/result';

// Costo de bcrypt — factor de trabajo para el hash de contraseña.
// Valor 12: balance entre seguridad y performance (~300ms en hardware moderno).
// No bajar de 10 en producción. Subir a 13-14 si el hardware lo permite.
const BCRYPT_SALT_ROUNDS = 12;

// TTL del refresh token en milisegundos — 7 días
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,

    @Inject(ONBOARDING_PORT)
    private readonly onboardingPort: OnboardingPort,

    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,

    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RegisterDto): Promise<Result<AuthResponseDto, ConflictError | ValidationError>> {

    // 1. Validar formato de email
    const emailResult = Email.create(dto.email);
    if (!emailResult.ok) return fail(new ValidationError('Email inválido'));

    // 2. Verificar unicidad de email
    const emailEnUso = await this.usuarioRepository.existePorEmail(emailResult.value);
    if (emailEnUso) {
      return fail(new ConflictError(`El email '${emailResult.value.value}' ya está registrado`));
    }

    // 3. Verificar unicidad de RUC
    const rucEnUso = await this.onboardingPort.existeColegioConRuc(dto.colegioRuc);
    if (rucEnUso) {
      return fail(new ConflictError('Ya existe un colegio registrado con ese RUC'));
    }

    // 4. Hash de contraseña
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // 5. Crear persona + usuario + colegio + rol + asignación en una sola transacción atómica
    const { colegioId, usuarioId, email, nombres, apellidos, asignacion } =
      await this.onboardingPort.crearColegioConSuperAdmin({
        nombre:    dto.colegioNombre,
        ruc:       dto.colegioRuc,
        direccion: dto.colegioDireccion,
        email:     dto.colegioEmail,
        usuarioEmail:     emailResult.value.value,
        usuarioPassword:  passwordHash,
        usuarioNombres:   dto.nombres,
        usuarioApellidos: dto.apellidos,
        usuarioDni:       dto.dni,
        usuarioTelefono:  dto.telefono,
      });

    // 6. Generar access token con el contexto del colegio recién creado
    const accessToken = this.jwtService.sign({
      sub:       usuarioId,
      email,
      colegioId,
      sedeId:    null,
      rolId:     asignacion.rolId,
      esSistema: true,
      permisos:  [],
    });

    // 7. Generar y persistir refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');
    await this.refreshTokenRepository.create({
      token:     refreshToken,
      usuarioId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return ok({
      accessToken,
      refreshToken,
      usuario: { id: usuarioId, email, nombres, apellidos },
      colegioId,
      sedeId:    null,
      rolId:     asignacion.rolId,
      rolNombre: 'SUPER_ADMIN',
      esSistema: true,
      permisos:  [],
    });
  }
}