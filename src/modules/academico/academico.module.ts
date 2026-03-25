import { Module } from '@nestjs/common';
import { AuthModule }     from '@modules/auth/auth.module';
import { ColegiosModule } from '@modules/colegios/colegios.module';
import { DocentesModule } from '@modules/docentes/docentes.module';

import { AcademicoController } from './infrastructure/controllers/academico.controller';

import { PERIODO_EVALUACION_REPOSITORY }   from './domain/repositories/periodo-evaluacion.repository';
import { CATEGORIA_EVALUACION_REPOSITORY } from './domain/repositories/categoria-evaluacion.repository';
import { ACTIVIDAD_REPOSITORY }            from './domain/repositories/actividad.repository';
import { NOTA_ACTIVIDAD_REPOSITORY }       from './domain/repositories/nota-actividad.repository';
import { NOTA_PERIODO_REPOSITORY }         from './domain/repositories/nota-periodo.repository';
import { ASISTENCIA_REPOSITORY }           from './domain/repositories/asistencia.repository';

import { PrismaPeriodoEvaluacionRepository }   from './infrastructure/persistence/prisma-periodo-evaluacion.repository';
import { PrismaCategoriaEvaluacionRepository } from './infrastructure/persistence/prisma-categoria-evaluacion.repository';
import { PrismaActividadRepository }           from './infrastructure/persistence/prisma-actividad.repository';
import { PrismaNotaActividadRepository }       from './infrastructure/persistence/prisma-nota-actividad.repository';
import { PrismaNotaPeriodoRepository }         from './infrastructure/persistence/prisma-nota-periodo.repository';
import { PrismaAsistenciaRepository }          from './infrastructure/persistence/prisma-asistencia.repository';

import { NotaCalculadoraService } from './application/nota-calculadora.service';

import { CrearPeriodoUseCase }         from './application/use-cases/crear-periodo.use-case';
import { ListarPeriodosUseCase }        from './application/use-cases/listar-periodos.use-case';
import { ActualizarPeriodoUseCase }     from './application/use-cases/actualizar-periodo.use-case';
import { CambiarEstadoPeriodoUseCase }  from './application/use-cases/cambiar-estado-periodo.use-case';
import { CrearCategoriaUseCase }        from './application/use-cases/crear-categoria.use-case';
import { ListarCategoriasUseCase }      from './application/use-cases/listar-categorias.use-case';
import { ActualizarCategoriaUseCase }   from './application/use-cases/actualizar-categoria.use-case';
import { EliminarCategoriaUseCase }     from './application/use-cases/eliminar-categoria.use-case';
import { CrearActividadUseCase }        from './application/use-cases/crear-actividad.use-case';
import { ListarActividadesUseCase }     from './application/use-cases/listar-actividades.use-case';
import { ActualizarActividadUseCase }   from './application/use-cases/actualizar-actividad.use-case';
import { EliminarActividadUseCase }     from './application/use-cases/eliminar-actividad.use-case';
import { RegistrarNotaUseCase }         from './application/use-cases/registrar-nota.use-case';
import { RegistrarNotasBulkUseCase }    from './application/use-cases/registrar-notas-bulk.use-case';
import { ListarNotasActividadUseCase }  from './application/use-cases/listar-notas-actividad.use-case';
import { ListarNotasAlumnoUseCase }     from './application/use-cases/listar-notas-alumno.use-case';
import { RegistrarAsistenciaClaseUseCase } from './application/use-cases/registrar-asistencia-clase.use-case';
import { CorregirAsistenciaUseCase }    from './application/use-cases/corregir-asistencia.use-case';
import { ListarAsistenciasClaseUseCase } from './application/use-cases/listar-asistencias-clase.use-case';
import { ListarAsistenciasAlumnoUseCase } from './application/use-cases/listar-asistencias-alumno.use-case';

@Module({
  imports: [AuthModule, ColegiosModule, DocentesModule],
  controllers: [AcademicoController],
  providers: [
    { provide: PERIODO_EVALUACION_REPOSITORY,   useClass: PrismaPeriodoEvaluacionRepository   },
    { provide: CATEGORIA_EVALUACION_REPOSITORY, useClass: PrismaCategoriaEvaluacionRepository },
    { provide: ACTIVIDAD_REPOSITORY,            useClass: PrismaActividadRepository           },
    { provide: NOTA_ACTIVIDAD_REPOSITORY,       useClass: PrismaNotaActividadRepository       },
    { provide: NOTA_PERIODO_REPOSITORY,         useClass: PrismaNotaPeriodoRepository         },
    { provide: ASISTENCIA_REPOSITORY,           useClass: PrismaAsistenciaRepository          },

    NotaCalculadoraService,

    CrearPeriodoUseCase,
    ListarPeriodosUseCase,
    ActualizarPeriodoUseCase,
    CambiarEstadoPeriodoUseCase,

    CrearCategoriaUseCase,
    ListarCategoriasUseCase,
    ActualizarCategoriaUseCase,
    EliminarCategoriaUseCase,

    CrearActividadUseCase,
    ListarActividadesUseCase,
    ActualizarActividadUseCase,
    EliminarActividadUseCase,

    RegistrarNotaUseCase,
    RegistrarNotasBulkUseCase,
    ListarNotasActividadUseCase,
    ListarNotasAlumnoUseCase,

    RegistrarAsistenciaClaseUseCase,
    CorregirAsistenciaUseCase,
    ListarAsistenciasClaseUseCase,
    ListarAsistenciasAlumnoUseCase,
  ],
})
export class AcademicoModule {}
