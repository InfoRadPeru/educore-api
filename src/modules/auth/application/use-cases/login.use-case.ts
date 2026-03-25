// Qué es: Caso de uso de login. Orquesta el flujo completo.
// Patrón: Use Case Pattern + Result Pattern.
// Principio SOLID: Single Responsibility — solo maneja el login. Dependency Inversion — depende de UsuarioRepository (interfaz).
// Por qué nunca lanza excepciones: El resultado es explícito. Quien llama sabe que puede fallar y lo maneja. No hay sorpresas.

import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ok, fail, Result, UnauthorizedError } from "@shared/domain/result";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { USUARIO_REPOSITORY, type UsuarioRepository } from "@modules/auth/domain/repositories/usuario.repository";
import { LoginDto } from "../dtos/login.dto";
import { AuthResponseDto, MultiContextResponseDto, UsuarioResponseDto } from "../dtos/auth-response.dto";
import { REFRESH_TOKEN_REPOSITORY, type RefreshTokenRepository } from "@modules/auth/domain/repositories/refresh-token.repository";
import { ASIGNACION_REPOSITORY, type AsignacionRepository } from "@modules/auth/domain/repositories/asignacion.repository";
import { Usuario } from "@modules/auth/domain/entities/usuario.entity";
import { Asignacion } from "@modules/auth/domain/entities/asignacion.entity";

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(ASIGNACION_REPOSITORY)
    private readonly asignacionRepository: AsignacionRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<Result<AuthResponseDto | MultiContextResponseDto, UnauthorizedError>> {
    const usuario = await this.usuarioRepository.buscarPorIdentifier(dto.identifier);
    if (!usuario || !usuario.estaActivo()) return fail(new UnauthorizedError());

    if (usuario.estaBloqueado()) {
      return fail(new UnauthorizedError(
        `Cuenta bloqueada. Intenta nuevamente en ${Usuario.MINUTOS_BLOQUEO} minutos`,
      ));
    }

    const passwordValido = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordValido) {
      const intentos = await this.usuarioRepository.incrementarIntentosFallidos(usuario.id);
      if (intentos >= Usuario.MAX_INTENTOS_FALLIDOS) {
        const bloqueadoHasta = new Date(Date.now() + Usuario.MINUTOS_BLOQUEO * 60 * 1000);
        await this.usuarioRepository.bloquearCuenta(usuario.id, bloqueadoHasta);
        return fail(new UnauthorizedError(
          `Demasiados intentos. Cuenta bloqueada por ${Usuario.MINUTOS_BLOQUEO} minutos`,
        ));
      }
      return fail(new UnauthorizedError());
    }

    await this.usuarioRepository.resetearIntentosFallidos(usuario.id);
    await this.usuarioRepository.actualizarUltimoAcceso(usuario.id);

    // PlatformAdmin sin asignaciones — acceso directo a gestión de plataforma
    if (usuario.esPlatformAdmin) {
      return this.generarRespuestaPlatformAdmin(usuario);
    }

    const asignaciones = await this.asignacionRepository.findByUsuario(usuario.id);
    const activas = asignaciones.filter(a => a.activo);

    if (activas.length === 0) return fail(new UnauthorizedError('Sin asignaciones activas'));

    if (activas.length === 1) {
      return this.generarTokenParaAsignacion(usuario, activas[0]);
    }

    // Múltiples asignaciones — tempToken de 5 minutos solo para /select-context
    const tempToken = this.jwtService.sign(
      { sub: usuario.id, tipo: 'select-context' },
      { expiresIn: '5m' },
    );

    return ok({
      requiereSeleccion: true,
      tempToken,
      asignaciones: activas.map(a => ({
        id:            a.id,
        colegioId:     a.colegioId,
        colegioNombre: a.colegioNombre,
        sedeId:        a.sedeId,
        sedeNombre:    a.sedeNombre,
        rolNombre:     a.rolNombre,
      })),
    });
  }

  private usuarioDto(usuario: Usuario): UsuarioResponseDto {
    return {
      id:       usuario.id,
      email:    usuario.email.value,
      nombres:  usuario.nombres,
      apellidos: usuario.apellidos,
    };
  }

  private async crearRefreshToken(usuarioId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    await this.refreshTokenRepository.create({
      token,
      usuarioId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return token;
  }

  private async generarTokenParaAsignacion(
    usuario: Usuario,
    asignacion: Asignacion,
  ): Promise<Result<AuthResponseDto, never>> {
    const accessToken = this.jwtService.sign({
      sub:       usuario.id,
      email:     usuario.email.value,
      colegioId: asignacion.colegioId,
      sedeId:    asignacion.sedeId,
      rolId:     asignacion.rolId,
      esSistema: asignacion.esSistema,
      permisos:  asignacion.permisos,
    });

    const refreshToken = await this.crearRefreshToken(usuario.id);

    return ok({
      accessToken,
      refreshToken,
      usuario:   this.usuarioDto(usuario),
      colegioId: asignacion.colegioId,
      sedeId:    asignacion.sedeId,
      rolId:     asignacion.rolId,
      rolNombre: asignacion.rolNombre,
      esSistema: asignacion.esSistema,
      permisos:  asignacion.permisos,
    });
  }

  private async generarRespuestaPlatformAdmin(
    usuario: Usuario,
  ): Promise<Result<AuthResponseDto, never>> {
    const accessToken = this.jwtService.sign({
      sub:             usuario.id,
      email:           usuario.email.value,
      esPlatformAdmin: true,
    });

    const refreshToken = await this.crearRefreshToken(usuario.id);

    return ok({
      accessToken,
      refreshToken,
      usuario:   this.usuarioDto(usuario),
      colegioId: null,
      sedeId:    null,
      rolId:     null,
      rolNombre: 'PLATFORM_ADMIN',
      esSistema: true,
      permisos:  ['*'],
    });
  }
}