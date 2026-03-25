// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Módulo Auth — ensambla autenticación, JWT y registro de usuarios.
//
// CAMBIO CLAVE vs versión anterior:
//   ANTES: { provide: COLEGIO_REPOSITORY, useClass: PrismaColegioRepository }
//     → Registraba el token 'ColegioRepository' — colisionaba con el
//       mismo token en ColegiosModule. Bug silencioso en runtime.
//
//   AHORA: { provide: ONBOARDING_PORT, useClass: OnboardingAdapter }
//     → Token único 'OnboardingPort'. Sin colisión posible.
//     → El nombre comunica la intención: esto es para onboarding,
//       no para gestión general de colegios.
//
// PRINCIPIO: Dependency Inversion en acción.
//   Los use cases declaran QUÉ necesitan (interfaces/ports).
//   El módulo decide QUÉ implementación inyectar (adapters/repositories).
//   Los use cases nunca saben con qué implementación trabajan.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

// Adapters de infraestructura
import { OnboardingAdapter } from './infrastructure/adapters/onboarding.adapter';
import { PrismaUsuarioRepository } from './infrastructure/persistence/prisma-usuario.repository';
import { PrismaAsignacionRepository } from './infrastructure/persistence/prisma-asignacion.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/persistence/prisma-refresh-token.repository';
import { PrismaPasswordResetRepository } from './infrastructure/persistence/prisma-password-reset.repository';

// Tokens de inyección
import { ONBOARDING_PORT } from './domain/ports/onboarding.port';
import { USUARIO_REPOSITORY } from './domain/repositories/usuario.repository';
import { ASIGNACION_REPOSITORY } from './domain/repositories/asignacion.repository';
import { REFRESH_TOKEN_REPOSITORY } from './domain/repositories/refresh-token.repository';
import { PASSWORD_RESET_REPOSITORY } from './domain/repositories/password-reset.repository';

// Use cases
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { SelectContextUseCase } from './application/use-cases/select-context.use-case';
import { RefreshUseCase } from './application/use-cases/refresh.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { MeUseCase } from './application/use-cases/me.use-case';
import { EMAIL_PORT } from './domain/ports/email.port';
import { EmailAdapter } from './infrastructure/adapters/email.adapter';

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
    // ── Ports & Adapters ─────────────────────────────────────
    // ONBOARDING_PORT: Auth necesita crear colegios durante el registro.
    // OnboardingAdapter implementa ese contrato usando Prisma.
    // Token único — sin colisión con ColegiosModule.
    { provide: ONBOARDING_PORT,         useClass: OnboardingAdapter },

    // ── Repositories ─────────────────────────────────────────
    { provide: USUARIO_REPOSITORY,      useClass: PrismaUsuarioRepository },
    { provide: ASIGNACION_REPOSITORY,   useClass: PrismaAsignacionRepository },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: PrismaRefreshTokenRepository },
    { provide: PASSWORD_RESET_REPOSITORY, useClass: PrismaPasswordResetRepository },
    { provide: EMAIL_PORT, useClass: EmailAdapter },

    // ── Infraestructura ───────────────────────────────────────
    JwtStrategy,

    // ── Use Cases ─────────────────────────────────────────────
    LoginUseCase,
    RegisterUseCase,
    SelectContextUseCase,
    RefreshUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    ChangePasswordUseCase,
    MeUseCase,
  ],
  exports: [JwtModule, PassportModule, USUARIO_REPOSITORY],
})
export class AuthModule {}