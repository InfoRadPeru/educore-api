// Qué es: Ensambla todas las piezas del módulo Colegios.
// Patrón: Dependency Inversion — el token COLEGIO_REPOSITORY es la interfaz,
// PrismaColegioRepository es la implementación. Los use cases piden la interfaz.

import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { ColegiosController } from './infrastructure/controllers/colegios.controller';
import { PrismaColegioRepository } from './infrastructure/persistence/prisma-colegio.repository';
import { COLEGIO_REPOSITORY } from './domain/repositories/colegio.repository';

import { ObtenerMiColegioUseCase }       from './application/use-cases/obtener-mi-colegio.use-case';
import { ActualizarMiColegioUseCase }    from './application/use-cases/actualizar-mi-colegio.use-case';
import { ObtenerConfiguracionUseCase }   from './application/use-cases/obtener-configuracion.use-case';
import { ActualizarConfiguracionUseCase } from './application/use-cases/actualizar-configuracion.use-case';
import { ObtenerPlanUseCase }            from './application/use-cases/obtener-plan.use-case';
import { ListarSedesUseCase }            from './application/use-cases/listar-sedes.use-case';
import { CrearSedeUseCase }              from './application/use-cases/crear-sede.use-case';
import { ActualizarSedeUseCase }         from './application/use-cases/actualizar-sede.use-case';
import { CambiarEstadoSedeUseCase }      from './application/use-cases/cambiar-estado-sede.use-case';
import { ListarNivelesUseCase }          from './application/use-cases/listar-niveles.use-case';
import { CambiarEstadoNivelUseCase }     from './application/use-cases/cambiar-estado-nivel.use-case';
import { ListarColegiosUseCase }         from './application/use-cases/listar-colegios.use-case';
import { CambiarPlanUseCase }            from './application/use-cases/cambiar-plan.use-case';
import { CambiarEstadoColegioUseCase }   from './application/use-cases/cambiar-estado-colegio.use-case';

@Module({
  imports: [AuthModule],
  controllers: [ColegiosController],
  providers: [
    { provide: COLEGIO_REPOSITORY, useClass: PrismaColegioRepository },
    ObtenerMiColegioUseCase,
    ActualizarMiColegioUseCase,
    ObtenerConfiguracionUseCase,
    ActualizarConfiguracionUseCase,
    ObtenerPlanUseCase,
    ListarSedesUseCase,
    CrearSedeUseCase,
    ActualizarSedeUseCase,
    CambiarEstadoSedeUseCase,
    ListarNivelesUseCase,
    CambiarEstadoNivelUseCase,
    ListarColegiosUseCase,
    CambiarPlanUseCase,
    CambiarEstadoColegioUseCase,
  ],
})
export class ColegiosModule {}