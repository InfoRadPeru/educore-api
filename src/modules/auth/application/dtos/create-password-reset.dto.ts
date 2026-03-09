export interface CreatePasswordResetDto {
  token:      string;
  usuarioId:  string;
  expiresAt:  Date;
}