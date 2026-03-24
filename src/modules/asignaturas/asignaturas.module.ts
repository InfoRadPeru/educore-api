import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';

import { AsignaturasController }      from './infrastructure/controllers/asignaturas.controller';
import { AdminAsignaturasController } from './infrastructure/controllers/admin-asignaturas.controller';

import { ASIGNATURA_MAESTRA_REPOSITORY }   from './domain/repositories/asignatura-maestra.repository';
import { COLEGIO_ASIGNATURA_REPOSITORY }   from './domain/repositories/colegio-asignatura.repository';
import { GRADO_ASIGNATURA_REPOSITORY }     from './domain/repositories/grado-asignatura.repository';
import { PrismaAsignaturaMaestraRepository,
         PrismaColegioAsignaturaRepository } from './infrastructure/persistence/prisma-asignatura.repository';
import { PrismaGradoAsignaturaRepository } from './infrastructure/persistence/prisma-grado-asignatura.repository';

import { ListarAsignaturasMaestrasUseCase }        from './application/use-cases/listar-asignaturas-maestras.use-case';
import { CrearAsignaturaMaestraUseCase }            from './application/use-cases/crear-asignatura-maestra.use-case';
import { ActualizarAsignaturaMaestraUseCase }       from './application/use-cases/actualizar-asignatura-maestra.use-case';
import { CambiarEstadoAsignaturaMaestraUseCase }    from './application/use-cases/cambiar-estado-asignatura-maestra.use-case';
import { ListarAsignaturasColegioUseCase }          from './application/use-cases/listar-asignaturas-colegio.use-case';
import { ActivarAsignaturaColegioUseCase }          from './application/use-cases/activar-asignatura-colegio.use-case';
import { DesactivarAsignaturaColegioUseCase }       from './application/use-cases/desactivar-asignatura-colegio.use-case';
import { RenombrarAsignaturaColegioUseCase }        from './application/use-cases/renombrar-asignatura-colegio.use-case';
import { ListarAsignaturasGradoUseCase }            from './application/use-cases/listar-asignaturas-grado.use-case';
import { AsignarAsignaturaGradoUseCase }            from './application/use-cases/asignar-asignatura-grado.use-case';
import { ActualizarHorasGradoUseCase }             from './application/use-cases/actualizar-horas-grado.use-case';
import { RemoverAsignaturaGradoUseCase }            from './application/use-cases/remover-asignatura-grado.use-case';

@Module({
  imports: [AuthModule],
  controllers: [AsignaturasController, AdminAsignaturasController],
  providers: [
    { provide: ASIGNATURA_MAESTRA_REPOSITORY,  useClass: PrismaAsignaturaMaestraRepository  },
    { provide: COLEGIO_ASIGNATURA_REPOSITORY,  useClass: PrismaColegioAsignaturaRepository  },
    { provide: GRADO_ASIGNATURA_REPOSITORY,    useClass: PrismaGradoAsignaturaRepository    },

    // AsignaturaMaestra
    ListarAsignaturasMaestrasUseCase,
    CrearAsignaturaMaestraUseCase,
    ActualizarAsignaturaMaestraUseCase,
    CambiarEstadoAsignaturaMaestraUseCase,

    // ColegioAsignatura
    ListarAsignaturasColegioUseCase,
    ActivarAsignaturaColegioUseCase,
    DesactivarAsignaturaColegioUseCase,
    RenombrarAsignaturaColegioUseCase,

    // GradoAsignatura
    ListarAsignaturasGradoUseCase,
    AsignarAsignaturaGradoUseCase,
    ActualizarHorasGradoUseCase,
    RemoverAsignaturaGradoUseCase,
  ],
  exports: [
    { provide: COLEGIO_ASIGNATURA_REPOSITORY, useClass: PrismaColegioAsignaturaRepository },
    { provide: GRADO_ASIGNATURA_REPOSITORY,   useClass: PrismaGradoAsignaturaRepository   },
  ],
})
export class AsignaturasModule {}
