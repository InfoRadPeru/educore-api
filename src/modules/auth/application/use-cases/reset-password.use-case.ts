import { USUARIO_REPOSITORY, type UsuarioRepository } from "@modules/auth/domain/repositories/usuario.repository";
import { Inject, Injectable } from "@nestjs/common";
import { ResetPasswordDto } from "../dtos/reset-password.dto";
import { ok, fail, Result, UnauthorizedError, ValidationError } from '@shared/domain/result';
import * as bcrypt from 'bcrypt';
import { PASSWORD_RESET_REPOSITORY, type PasswordResetRepository } from "@modules/auth/domain/repositories/password-reset.repository";

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<Result<void, UnauthorizedError | ValidationError>> {
    const resetData = await this.passwordResetRepository.findByToken(dto.token);

    if (!resetData || resetData.usado || new Date() > resetData.expiresAt) {
      return fail(new UnauthorizedError('Token inválido o expirado'));
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.usuarioRepository.actualizarPassword(resetData.usuarioId, passwordHash);
    await this.passwordResetRepository.marcarUsado(dto.token);

    return ok(undefined);
  }
}