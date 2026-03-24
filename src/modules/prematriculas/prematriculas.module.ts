import { Module } from '@nestjs/common';
import { AuthModule }     from '@modules/auth/auth.module';
import { AlumnosModule }  from '@modules/alumnos/alumnos.module';
import { MatriculasModule } from '@modules/matriculas/matriculas.module';

import { PrematriculasController } from './infrastructure/controllers/prematriculas.controller';

import { PREMATRICULA_REPOSITORY } from './domain/repositories/prematricula.repository';
import { PrismaPrematriculaRepository } from './infrastructure/persistence/prisma-prematricula.repository';

import { CrearPrematriculaUseCase }     from './application/use-cases/crear-prematricula.use-case';
import { ListarPrematriculasUseCase }   from './application/use-cases/listar-prematriculas.use-case';
import { ConfirmarPrematriculaUseCase } from './application/use-cases/confirmar-prematricula.use-case';
import { CancelarPrematriculaUseCase }  from './application/use-cases/cancelar-prematricula.use-case';

@Module({
  imports: [AuthModule, AlumnosModule, MatriculasModule],
  controllers: [PrematriculasController],
  providers: [
    { provide: PREMATRICULA_REPOSITORY, useClass: PrismaPrematriculaRepository },
    CrearPrematriculaUseCase,
    ListarPrematriculasUseCase,
    ConfirmarPrematriculaUseCase,
    CancelarPrematriculaUseCase,
  ],
})
export class PrematriculasModule {}
