import { Module } from '@nestjs/common';
import { AuthModule }        from '@modules/auth/auth.module';
import { AsignaturasModule } from '@modules/asignaturas/asignaturas.module';

import { DocentesController } from './infrastructure/controllers/docentes.controller';

import { DOCENTE_REPOSITORY }        from './domain/repositories/docente.repository';
import { PrismaDocenteRepository }   from './infrastructure/persistence/prisma-docente.repository';

import { RegistrarDocenteUseCase }    from './application/use-cases/registrar-docente.use-case';
import { ListarDocentesUseCase }      from './application/use-cases/listar-docentes.use-case';
import { ObtenerDocenteUseCase }      from './application/use-cases/obtener-docente.use-case';
import { ActualizarDocenteUseCase }   from './application/use-cases/actualizar-docente.use-case';
import { CambiarEstadoDocenteUseCase } from './application/use-cases/cambiar-estado-docente.use-case';
import { AsignarSeccionUseCase }      from './application/use-cases/asignar-seccion.use-case';
import { RemoverAsignacionUseCase }   from './application/use-cases/remover-asignacion.use-case';

@Module({
  imports: [AuthModule, AsignaturasModule],
  controllers: [DocentesController],
  providers: [
    { provide: DOCENTE_REPOSITORY, useClass: PrismaDocenteRepository },
    RegistrarDocenteUseCase,
    ListarDocentesUseCase,
    ObtenerDocenteUseCase,
    ActualizarDocenteUseCase,
    CambiarEstadoDocenteUseCase,
    AsignarSeccionUseCase,
    RemoverAsignacionUseCase,
  ],
  exports: [
    { provide: DOCENTE_REPOSITORY, useClass: PrismaDocenteRepository },
  ],
})
export class DocentesModule {}
