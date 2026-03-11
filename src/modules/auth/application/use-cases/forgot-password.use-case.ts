import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import * as crypto from 'crypto';
import { USUARIO_REPOSITORY, type UsuarioRepository } from '@modules/auth/domain/repositories/usuario.repository';
import { PASSWORD_RESET_REPOSITORY, type PasswordResetRepository } from '@modules/auth/domain/repositories/password-reset.repository';
import { EMAIL_PORT, type EmailPort } from '@modules/auth/domain/ports/email.port';
import { Email } from '@modules/auth/domain/value-objects/email.vo';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ForgotPasswordResponseDto } from '../dtos/forgot-password-response.dto';

// Respuesta siempre igual — no revelar si el email existe o no
const RESPUESTA_GENERICA = { message: 'Si el email existe, recibirás instrucciones.' };

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepository,
    @Inject(EMAIL_PORT)
    private readonly emailPort: EmailPort,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<Result<ForgotPasswordResponseDto, never>> {
    const emailResult = Email.create(dto.email);
    if (!emailResult.ok) return ok(RESPUESTA_GENERICA);

    const usuario = await this.usuarioRepository.buscarPorEmail(emailResult.value);
    if (!usuario) return ok(RESPUESTA_GENERICA);

    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.passwordResetRepository.create({ token, usuarioId: usuario.id, expiresAt });

    await this.emailPort.enviarRecuperacionPassword({
      destinatario: usuario.email.value,
      nombres:      usuario.nombres,
      token,
    });

    return ok(RESPUESTA_GENERICA);
  }
}