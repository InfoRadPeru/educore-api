import { USUARIO_REPOSITORY, type UsuarioRepository } from "@modules/auth/domain/repositories/usuario.repository";
import { Inject, Injectable } from "@nestjs/common";
import { ForgotPasswordDto } from "../dtos/forgot-password.dto";
import { ok, Result } from "@shared/domain/result";
import { ForgotPasswordResponseDto } from "../dtos/forgot-password-response.dto";
import { Email } from "@modules/auth/domain/value-objects/email.vo";
import * as crypto from 'crypto';
import { PASSWORD_RESET_REPOSITORY, type PasswordResetRepository } from "@modules/auth/domain/repositories/password-reset.repository";

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<Result<ForgotPasswordResponseDto, never>> {
    // Siempre retorna éxito — no revelar si el email existe
    const emailResult = Email.create(dto.email);
    if (!emailResult.ok) {
      return ok({ message: 'Si el email existe, recibirás instrucciones.' });
    }

    const usuario = await this.usuarioRepository.buscarPorEmail(emailResult.value);
    if (!usuario) {
      return ok({ message: 'Si el email existe, recibirás instrucciones.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.passwordResetRepository.create({
      token,
      usuarioId: usuario.id,
      expiresAt,
    });

    // TODO: enviar email con token
    // Por ahora retornamos el token en desarrollo
    return ok({ message: 'Si el email existe, recibirás instrucciones.' });
  }
}