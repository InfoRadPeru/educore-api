import { CreateRefreshTokenDto } from "@modules/auth/application/dtos/create-refresh-token.dto";
import { RefreshTokenRepository } from "@modules/auth/domain/repositories/refresh-token.repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRefreshTokenDto): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        token:      dto.token,
        usuarioId:  dto.usuarioId,
        expiresAt:  dto.expiresAt,
      },
    });
  }

  async findByToken(token: string) {
    const raw = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    if (!raw) return null;
    return {
      usuarioId: raw.usuarioId,
      expiresAt: raw.expiresAt,
      revocado:  raw.revocado,
    };
  }

  async revocarToken(token: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { token },
      data:  { revocado: true },
    });
  }

  async revocarTodosDeUsuario(usuarioId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { usuarioId },
      data:  { revocado: true },
    });
  }
}