// Qué es: Ensambla todas las piezas del módulo Auth.
// Principio: Dependency Inversion en acción — el token 'UsuarioRepository' es la interfaz, PrismaUsuarioRepository es la implementación. Los use cases piden la interfaz, NestJS inyecta la implementación.

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./infrastructure/controllers/auth.controller";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { RegisterUseCase } from "./application/use-cases/register.use-case";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { PrismaUsuarioRepository } from "./infrastructure/persistence/prisma-usuario.repository";
import { PrismaRefreshTokenRepository } from "./infrastructure/persistence/prisma-refresh-token.repository";
import { RefreshUseCase } from "./application/use-cases/refresh.use-case";
import { LogoutUseCase } from "./application/use-cases/logout.use-case";
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.use-case";
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case";
import { ChangePasswordUseCase } from "./application/use-cases/change-password.use-case";
import { MeUseCase } from "./application/use-cases/me.use-case";
import { PrismaPasswordResetRepository } from "./infrastructure/persistence/prisma-password-reset.repository";
import { SelectContextUseCase } from "./application/use-cases/select-context.use-case";
import { USUARIO_REPOSITORY } from "./domain/repositories/usuario.repository";
import { ASIGNACION_REPOSITORY } from "./domain/repositories/asignacion.repository";
import { COLEGIO_REPOSITORY } from "./domain/repositories/colegio.repository";
import { REFRESH_TOKEN_REPOSITORY } from "./domain/repositories/refresh-token.repository";
import { PASSWORD_RESET_REPOSITORY } from "./domain/repositories/password-reset.repository";
import { PrismaAsignacionRepository } from "./infrastructure/persistence/prisma-asignacion.repository";
import { PrismaColegioRepository } from "./infrastructure/persistence/prisma-colegio.repository";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:      config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') ?? '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Use cases
    LoginUseCase,
    RegisterUseCase,
    SelectContextUseCase,
    RefreshUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    ChangePasswordUseCase,
    MeUseCase,
    // Infraestructura
    JwtStrategy,
    { provide: USUARIO_REPOSITORY,        useClass: PrismaUsuarioRepository },
    { provide: ASIGNACION_REPOSITORY,     useClass: PrismaAsignacionRepository },
    { provide: COLEGIO_REPOSITORY,        useClass: PrismaColegioRepository },
    { provide: REFRESH_TOKEN_REPOSITORY,  useClass: PrismaRefreshTokenRepository },
    { provide: PASSWORD_RESET_REPOSITORY, useClass: PrismaPasswordResetRepository },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}