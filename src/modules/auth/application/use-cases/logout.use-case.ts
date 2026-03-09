import { REFRESH_TOKEN_REPOSITORY, type RefreshTokenRepository } from "@modules/auth/domain/repositories/refresh-token.repository";
import { Inject, Injectable } from "@nestjs/common";
import { LogoutDto } from "../dtos/logout.dto";
import { ok, Result } from '@shared/domain/result';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(dto: LogoutDto): Promise<Result<void, never>> {
    await this.refreshTokenRepository.revocarToken(dto.refreshToken);
    return ok(undefined);
  }
}