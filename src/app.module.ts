import { AuthModule } from '@modules/auth/auth.module';
import { ColegiosModule } from '@modules/colegios/colegios.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@shared/infrastructure/filters/http-exception.filter';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ColegiosModule,
  ],
  providers: [
    {
      provide:  APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}