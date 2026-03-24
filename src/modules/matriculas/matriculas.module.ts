import { Module } from '@nestjs/common';
import { AuthModule }    from '@modules/auth/auth.module';
import { AlumnosModule } from '@modules/alumnos/alumnos.module';

import { MatriculasController } from './infrastructure/controllers/matriculas.controller';

import { MATRICULA_REPOSITORY } from './domain/repositories/matricula.repository';
import { PrismaMatriculaRepository } from './infrastructure/persistence/prisma-matricula.repository';

import { MatricularAlumnoUseCase }       from './application/use-cases/matricular-alumno.use-case';
import { ListarMatriculasUseCase }       from './application/use-cases/listar-matriculas.use-case';
import { CambiarEstadoMatriculaUseCase } from './application/use-cases/cambiar-estado-matricula.use-case';

@Module({
  imports: [AuthModule, AlumnosModule],
  controllers: [MatriculasController],
  providers: [
    { provide: MATRICULA_REPOSITORY, useClass: PrismaMatriculaRepository },
    MatricularAlumnoUseCase,
    ListarMatriculasUseCase,
    CambiarEstadoMatriculaUseCase,
  ],
  exports: [MATRICULA_REPOSITORY],
})
export class MatriculasModule {}
