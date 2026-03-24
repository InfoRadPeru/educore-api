import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';

import { BoletinController } from './infrastructure/controllers/boletin.controller';

import { PUBLICACION_BOLETIN_REPOSITORY }           from './domain/repositories/publicacion-boletin.repository';
import { PrismaPublicacionBoletinRepository }        from './infrastructure/persistence/prisma-publicacion-boletin.repository';

import { BoletinQueryService }                       from './application/boletin-query.service';
import { ObtenerBoletinAlumnoUseCase }               from './application/use-cases/obtener-boletin-alumno.use-case';
import { ObtenerBoletinApoderadoUseCase }            from './application/use-cases/obtener-boletin-apoderado.use-case';
import { PublicarBoletinSeccionUseCase }             from './application/use-cases/publicar-boletin-seccion.use-case';
import { DespublicarBoletinUseCase }                 from './application/use-cases/despublicar-boletin.use-case';
import { ListarPublicacionesUseCase }                from './application/use-cases/listar-publicaciones.use-case';

@Module({
  imports: [AuthModule],
  controllers: [BoletinController],
  providers: [
    { provide: PUBLICACION_BOLETIN_REPOSITORY, useClass: PrismaPublicacionBoletinRepository },
    BoletinQueryService,
    ObtenerBoletinAlumnoUseCase,
    ObtenerBoletinApoderadoUseCase,
    PublicarBoletinSeccionUseCase,
    DespublicarBoletinUseCase,
    ListarPublicacionesUseCase,
  ],
})
export class BoletinModule {}
