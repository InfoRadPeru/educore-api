import { USUARIO_REPOSITORY, type UsuarioRepository } from "@modules/auth/domain/repositories/usuario.repository";
import { Inject, Injectable } from "@nestjs/common";
import { ChangePasswordDto } from "../dtos/change-password.dto";
import { ok, fail, Result, UnauthorizedError } from '@shared/domain/result';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChangePasswordUseCase {
  constructor(

    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    
  ) {}

  async execute(dto: ChangePasswordDto): Promise<Result<void, UnauthorizedError>> {
    const usuario = await this.usuarioRepository.buscarPorId(dto.usuarioId);
    if (!usuario) {
      return fail(new UnauthorizedError());
    }

    const passwordValido = await bcrypt.compare(dto.currentPassword, usuario.passwordHash);
    if (!passwordValido) {
      return fail(new UnauthorizedError('Contraseña actual incorrecta'));
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usuarioRepository.actualizarPassword(dto.usuarioId, passwordHash);

    return ok(undefined);
  }
}