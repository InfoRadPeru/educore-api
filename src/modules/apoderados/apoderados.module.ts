import { Module } from '@nestjs/common';
import { AuthModule }    from '@modules/auth/auth.module';
import { AlumnosModule } from '@modules/alumnos/alumnos.module';

import { ApoderadosController } from './infrastructure/controllers/apoderados.controller';

import { APODERADO_REPOSITORY }        from './domain/repositories/apoderado.repository';
import { PrismaApoderadoRepository }   from './infrastructure/persistence/prisma-apoderado.repository';

import { RegistrarApoderadoUseCase } from './application/use-cases/registrar-apoderado.use-case';
import { ObtenerApoderadoUseCase }   from './application/use-cases/obtener-apoderado.use-case';
import { ListarApoderadosUseCase }   from './application/use-cases/listar-apoderados.use-case';
import { AsignarAlumnoUseCase }      from './application/use-cases/asignar-alumno.use-case';
import { DesvincularAlumnoUseCase }  from './application/use-cases/desvincular-alumno.use-case';

@Module({
  imports: [AuthModule, AlumnosModule],
  controllers: [ApoderadosController],
  providers: [
    { provide: APODERADO_REPOSITORY, useClass: PrismaApoderadoRepository },
    RegistrarApoderadoUseCase,
    ObtenerApoderadoUseCase,
    ListarApoderadosUseCase,
    AsignarAlumnoUseCase,
    DesvincularAlumnoUseCase,
  ],
  exports: [APODERADO_REPOSITORY],
})
export class ApoderadosModule {}
