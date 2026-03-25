import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { NotificacionesModule } from '@modules/notificaciones/notificaciones.module';

import { ComunicadosController } from './infrastructure/controllers/comunicados.controller';

import { COMUNICADO_REPOSITORY }           from './domain/repositories/comunicado.repository';
import { PrismaComunicadoRepository }      from './infrastructure/persistence/prisma-comunicado.repository';

import { CrearComunicadoUseCase }            from './application/use-cases/crear-comunicado.use-case';
import { ActualizarComunicadoUseCase }       from './application/use-cases/actualizar-comunicado.use-case';
import { PublicarComunicadoUseCase }         from './application/use-cases/publicar-comunicado.use-case';
import { ArchivarComunicadoUseCase }         from './application/use-cases/archivar-comunicado.use-case';
import { EliminarComunicadoUseCase }         from './application/use-cases/eliminar-comunicado.use-case';
import { ListarComunicadosUseCase }          from './application/use-cases/listar-comunicados.use-case';
import { ObtenerComunicadoUseCase }          from './application/use-cases/obtener-comunicado.use-case';
import { ListarComunicadosApoderadoUseCase } from './application/use-cases/listar-comunicados-apoderado.use-case';
import { MarcarComunicadoLeidoUseCase }      from './application/use-cases/marcar-comunicado-leido.use-case';

@Module({
  imports: [AuthModule, NotificacionesModule],
  controllers: [ComunicadosController],
  providers: [
    { provide: COMUNICADO_REPOSITORY, useClass: PrismaComunicadoRepository },
    CrearComunicadoUseCase,
    ActualizarComunicadoUseCase,
    PublicarComunicadoUseCase,
    ArchivarComunicadoUseCase,
    EliminarComunicadoUseCase,
    ListarComunicadosUseCase,
    ObtenerComunicadoUseCase,
    ListarComunicadosApoderadoUseCase,
    MarcarComunicadoLeidoUseCase,
  ],
})
export class ComunicadosModule {}
