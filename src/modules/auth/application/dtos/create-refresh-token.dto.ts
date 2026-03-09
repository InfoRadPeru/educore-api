export interface CreateRefreshTokenDto {
  token:      string;
  usuarioId:  string;
  expiresAt:  Date;
}