import { CreatePasswordResetDto } from "@modules/auth/application/dtos/create-password-reset.dto";

export const PASSWORD_RESET_REPOSITORY = 'PasswordResetRepository';

export interface PasswordResetRepository {
  create(dto: CreatePasswordResetDto):          Promise<void>;
  findByToken(token: string):                   Promise<{ usuarioId: string; expiresAt: Date; usado: boolean } | null>;
  marcarUsado(token: string):                   Promise<void>;
}