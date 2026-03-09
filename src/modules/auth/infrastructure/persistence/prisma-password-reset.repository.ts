import { CreatePasswordResetDto } from "@modules/auth/application/dtos/create-password-reset.dto";
import { PasswordResetRepository } from "@modules/auth/domain/repositories/password-reset.repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";

@Injectable()
export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePasswordResetDto): Promise<void> {
    await this.prisma.passwordReset.create({
      data: {
        token:      dto.token,
        usuarioId:  dto.usuarioId,
        expiresAt:  dto.expiresAt,
      },
    });
  }

  async findByToken(token: string) {
    const raw = await this.prisma.passwordReset.findUnique({
      where: { token },
    });
    if (!raw) return null;
    return {
      usuarioId: raw.usuarioId,
      expiresAt: raw.expiresAt,
      usado:     raw.usado,
    };
  }

  async marcarUsado(token: string): Promise<void> {
    await this.prisma.passwordReset.update({
      where: { token },
      data:  { usado: true },
    });
  }
}