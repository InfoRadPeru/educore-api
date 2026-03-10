// Qué es: Rota el refresh token y genera nuevo access token.
// El nuevo access token replica exactamente el payload del anterior
// (mismo colegioId, rolId, permisos) — no recarga desde BD.
// Si el usuario cambió de rol, debe hacer login nuevamente.

import { REFRESH_TOKEN_REPOSITORY, type RefreshTokenRepository } from "@modules/auth/domain/repositories/refresh-token.repository";
import { USUARIO_REPOSITORY, type UsuarioRepository } from "@modules/auth/domain/repositories/usuario.repository";
import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { RefreshDto } from "../dtos/refresh.dto";
import { ok, fail, Result, UnauthorizedError } from '@shared/domain/result';
import { AuthResponseDto } from "../dtos/auth-response.dto";
import * as crypto from 'crypto';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RefreshDto): Promise<Result<AuthResponseDto, UnauthorizedError>> {
    const tokenData = await this.refreshTokenRepository.findByToken(dto.refreshToken);
    if (!tokenData || tokenData.revocado || new Date() > tokenData.expiresAt) {
      return fail(new UnauthorizedError('Refresh token inválido o expirado'));
    }

    const usuario = await this.usuarioRepository.buscarPorId(tokenData.usuarioId);
    if (!usuario || !usuario.estaActivo()) return fail(new UnauthorizedError());

    // Decodificar el access token anterior para replicar su payload de contexto
    // El refresh no recarga desde BD — si cambió el rol, hacer login de nuevo
    let contextPayload: Record<string, unknown> = {};
    if (dto.accessToken) {
      try {
        const decoded = this.jwtService.decode(dto.accessToken) as Record<string, unknown>;
        const { sub, email, iat, exp, ...ctx } = decoded;
        contextPayload = ctx;
      } catch {
        // Si no se puede decodificar, el nuevo token irá sin contexto
      }
    }

    await this.refreshTokenRepository.revocarToken(dto.refreshToken);

    const accessToken = this.jwtService.sign({
      sub:   usuario.id,
      email: usuario.email.value,
      ...contextPayload,
    });

    const nuevoRefreshToken = crypto.randomBytes(64).toString('hex');
    await this.refreshTokenRepository.create({
      token:     nuevoRefreshToken,
      usuarioId: usuario.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return ok({
      accessToken,
      refreshToken: nuevoRefreshToken,
      usuario:   { id: usuario.id, email: usuario.email.value, nombres: usuario.nombres, apellidos: usuario.apellidos },
      colegioId: (contextPayload.colegioId as string) ?? '',
      sedeId:    (contextPayload.sedeId as string | null) ?? null,
      rolId:     (contextPayload.rolId as string) ?? '',
      rolNombre: (contextPayload.rolNombre as string) ?? '',
      esSistema: (contextPayload.esSistema as boolean) ?? false,
      permisos:  (contextPayload.permisos as string[]) ?? [],
    });
  }
}