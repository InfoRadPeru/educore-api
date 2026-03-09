import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';

// Controllers — uno por actor
import { ColegiosController }      from './infrastructure/controllers/colegios.controller';
import { AdminColegiosController } from './infrastructure/controllers/admin.controller';

import { PrismaColegioRepository } from './infrastructure/persistence/prisma-colegio.repository';
import { COLEGIO_REPOSITORY }      from './domain/repositories/colegio.repository';

import { ObtenerMiColegioUseCase }        from './application/use-cases/obtener-mi-colegio.use-case';
import { ActualizarMiColegioUseCase }     from './application/use-cases/actualizar-mi-colegio.use-case';
import { ObtenerConfiguracionUseCase }    from './application/use-cases/obtener-configuracion.use-case';
import { ActualizarConfiguracionUseCase } from './application/use-cases/actualizar-configuracion.use-case';
import { ObtenerPlanUseCase }             from './application/use-cases/obtener-plan.use-case';
import { ListarSedesUseCase }             from './application/use-cases/listar-sedes.use-case';
import { CrearSedeUseCase }               from './application/use-cases/crear-sede.use-case';
import { ActualizarSedeUseCase }          from './application/use-cases/actualizar-sede.use-case';
import { CambiarEstadoSedeUseCase }       from './application/use-cases/cambiar-estado-sede.use-case';
import { ListarNivelesUseCase }           from './application/use-cases/listar-niveles.use-case';
import { CambiarEstadoNivelUseCase }      from './application/use-cases/cambiar-estado-nivel.use-case';
import { ListarColegiosUseCase }          from './application/use-cases/listar-colegios.use-case';
import { CambiarPlanUseCase }             from './application/use-cases/cambiar-plan.use-case';
import { CambiarEstadoColegioUseCase }    from './application/use-cases/cambiar-estado-colegio.use-case';
import { SEDE_REPOSITORY } from './domain/repositories/sede.repository';
import { PrismaSedeRepository } from './infrastructure/persistence/prisma-sede.repository';
import { PrismaNivelRepository } from './infrastructure/persistence/prisma-nivel.repository';
import { NIVEL_REPOSITORY } from './domain/repositories/nivel.repository';

@Module({
  imports: [AuthModule],
  // Dos controllers registrados — NestJS los enruta correctamente
  // porque ambos usan el prefijo 'colegios' pero con rutas distintas
  controllers: [ColegiosController, AdminColegiosController],
  providers: [
    { provide: COLEGIO_REPOSITORY, useClass: PrismaColegioRepository },
    { provide: SEDE_REPOSITORY,  useClass: PrismaSedeRepository  },
    { provide: NIVEL_REPOSITORY, useClass: PrismaNivelRepository },

    // Use cases — SUPER_ADMIN
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

    // Use cases — PLATFORM_ADMIN
    ListarColegiosUseCase,
    CambiarPlanUseCase,
    CambiarEstadoColegioUseCase,
  ],
})
export class ColegiosModule {}