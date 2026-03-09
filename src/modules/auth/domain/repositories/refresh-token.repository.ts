import { CreateRefreshTokenDto } from "@modules/auth/application/dtos/create-refresh-token.dto";

export const REFRESH_TOKEN_REPOSITORY = 'RefreshTokenRepository';

export interface RefreshTokenRepository {
  create(dto: CreateRefreshTokenDto):       Promise<void>;
  findByToken(token: string):               Promise<{ usuarioId: string; expiresAt: Date; revocado: boolean } | null>;
  revocarToken(token: string):              Promise<void>;
  revocarTodosDeUsuario(usuarioId: string): Promise<void>;
}