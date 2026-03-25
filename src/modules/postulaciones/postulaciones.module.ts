import { Module } from '@nestjs/common';
import { AuthModule }     from '@modules/auth/auth.module';
import { ColegiosModule } from '@modules/colegios/colegios.module';
import { AlumnosModule }  from '@modules/alumnos/alumnos.module';
import { MatriculasModule } from '@modules/matriculas/matriculas.module';

import { PostulacionesController } from './infrastructure/controllers/postulaciones.controller';

import { POSTULACION_REPOSITORY } from './domain/repositories/postulacion.repository';
import { PrismaPostulacionRepository } from './infrastructure/persistence/prisma-postulacion.repository';

import { CrearPostulacionUseCase }    from './application/use-cases/crear-postulacion.use-case';
import { ListarPostulacionesUseCase } from './application/use-cases/listar-postulaciones.use-case';
import { AprobarPostulacionUseCase }  from './application/use-cases/aprobar-postulacion.use-case';
import { RechazarPostulacionUseCase } from './application/use-cases/rechazar-postulacion.use-case';

@Module({
  imports: [AuthModule, ColegiosModule, AlumnosModule, MatriculasModule],
  controllers: [PostulacionesController],
  providers: [
    { provide: POSTULACION_REPOSITORY, useClass: PrismaPostulacionRepository },
    CrearPostulacionUseCase,
    ListarPostulacionesUseCase,
    AprobarPostulacionUseCase,
    RechazarPostulacionUseCase,
  ],
})
export class PostulacionesModule {}
