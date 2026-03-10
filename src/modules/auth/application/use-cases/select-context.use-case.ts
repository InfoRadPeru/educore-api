// Qué es: Cuando el usuario tiene múltiples asignaciones, elige con cuál entrar.
// Se llama después de login cuando requiereSeleccion = true.
// Recibe el tempToken (validado por JwtAuthGuard) y el asignacionId elegido.

import { ASIGNACION_REPOSITORY, type AsignacionRepository } from "@modules/auth/domain/repositories/asignacion.repository";
import { REFRESH_TOKEN_REPOSITORY, type RefreshTokenRepository } from "@modules/auth/domain/repositories/refresh-token.repository";
import { USUARIO_REPOSITORY, type UsuarioRepository } from "@modules/auth/domain/repositories/usuario.repository";
import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SelectContextDto } from "../dtos/select-context.dto";
import { Result, UnauthorizedError, ok, fail } from "@shared/domain/result";
import { AuthResponseDto } from "../dtos/auth-response.dto";
import * as crypto             from 'crypto';

@Injectable()
export class SelectContextUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(ASIGNACION_REPOSITORY)
    private readonly asignacionRepository: AsignacionRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(usuarioId: string, dto: SelectContextDto): Promise<Result<AuthResponseDto, UnauthorizedError>> {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario || !usuario.estaActivo()) return fail(new UnauthorizedError());

    const asignacion = await this.asignacionRepository.findById(dto.asignacionId);
    if (!asignacion || asignacion.usuarioId !== usuarioId || !asignacion.activo) {
      return fail(new UnauthorizedError('Asignación inválida'));
    }

    const accessToken = this.jwtService.sign({
      sub:       usuario.id,
      email:     usuario.email.value,
      colegioId: asignacion.colegioId,
      sedeId:    asignacion.sedeId,
      rolId:     asignacion.rolId,
      esSistema: asignacion.esSistema,
      permisos:  asignacion.permisos,
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
      sedeId:    asignacion.sedeId,
      rolId:     asignacion.rolId,
      rolNombre: asignacion.rolNombre,
      esSistema: asignacion.esSistema,
      permisos:  asignacion.permisos,
    });
  }
}