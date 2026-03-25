import { Module } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { NOTIFICACION_REPOSITORY }          from './domain/repositories/notificacion.repository';
import { PrismaNotificacionRepository }     from './infrastructure/persistence/prisma-notificacion.repository';
import { NotificacionService }              from './application/notificacion.service';
import { ListarNotificacionesUseCase }      from './application/use-cases/listar-notificaciones.use-case';
import { MarcarLeidaUseCase }               from './application/use-cases/marcar-leida.use-case';
import { MarcarTodasLeidasUseCase }         from './application/use-cases/marcar-todas-leidas.use-case';
import { NotificacionesController }         from './infrastructure/controllers/notificaciones.controller';

@Module({
  providers: [
    PrismaService,
    { provide: NOTIFICACION_REPOSITORY, useClass: PrismaNotificacionRepository },
    NotificacionService,
    ListarNotificacionesUseCase,
    MarcarLeidaUseCase,
    MarcarTodasLeidasUseCase,
  ],
  controllers: [NotificacionesController],
  exports: [NotificacionService],
})
export class NotificacionesModule {}
