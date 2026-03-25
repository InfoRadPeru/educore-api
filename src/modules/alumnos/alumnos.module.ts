import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';

import { AlumnosController } from './infrastructure/controllers/alumnos.controller';

import { ALUMNO_REPOSITORY } from './domain/repositories/alumno.repository';
import { PrismaAlumnoRepository } from './infrastructure/persistence/prisma-alumno.repository';

import { RegistrarAlumnoUseCase }     from './application/use-cases/registrar-alumno.use-case';
import { ListarAlumnosUseCase }       from './application/use-cases/listar-alumnos.use-case';
import { ObtenerAlumnoUseCase }       from './application/use-cases/obtener-alumno.use-case';
import { ActualizarAlumnoUseCase }    from './application/use-cases/actualizar-alumno.use-case';
import { CambiarEstadoAlumnoUseCase } from './application/use-cases/cambiar-estado-alumno.use-case';

@Module({
  imports: [AuthModule],
  controllers: [AlumnosController],
  providers: [
    { provide: ALUMNO_REPOSITORY, useClass: PrismaAlumnoRepository },
    RegistrarAlumnoUseCase,
    ListarAlumnosUseCase,
    ObtenerAlumnoUseCase,
    ActualizarAlumnoUseCase,
    CambiarEstadoAlumnoUseCase,
  ],
  exports: [ALUMNO_REPOSITORY],
})
export class AlumnosModule {}
