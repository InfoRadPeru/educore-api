import { Module } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { TESORERIA_REPOSITORY } from './domain/repositories/tesoreria.repository';
import { PrismaTesoreriaRepository } from './infrastructure/persistence/prisma-tesoreria.repository';

import { CrearConceptoUseCase }         from './application/use-cases/crear-concepto.use-case';
import { ListarConceptosUseCase }       from './application/use-cases/listar-conceptos.use-case';
import { ActualizarConceptoUseCase }    from './application/use-cases/actualizar-concepto.use-case';
import { ConfigurarTarifaUseCase }      from './application/use-cases/configurar-tarifa.use-case';
import { ListarTarifasUseCase }         from './application/use-cases/listar-tarifas.use-case';
import { EliminarTarifaUseCase }        from './application/use-cases/eliminar-tarifa.use-case';
import { GenerarCuotasAlumnoUseCase }   from './application/use-cases/generar-cuotas-alumno.use-case';
import { ListarCuotasAlumnoUseCase }    from './application/use-cases/listar-cuotas-alumno.use-case';
import { ListarMorosidadUseCase }       from './application/use-cases/listar-morosidad.use-case';
import { RegistrarPagoUseCase }         from './application/use-cases/registrar-pago.use-case';
import { AnularPagoUseCase }            from './application/use-cases/anular-pago.use-case';
import { ListarPagosUseCase }           from './application/use-cases/listar-pagos.use-case';
import { ResumenFinancieroUseCase }     from './application/use-cases/resumen-financiero.use-case';
import { TesoreriaController }          from './infrastructure/controllers/tesoreria.controller';

@Module({
  providers: [
    PrismaService,
    { provide: TESORERIA_REPOSITORY, useClass: PrismaTesoreriaRepository },
    CrearConceptoUseCase,
    ListarConceptosUseCase,
    ActualizarConceptoUseCase,
    ConfigurarTarifaUseCase,
    ListarTarifasUseCase,
    EliminarTarifaUseCase,
    GenerarCuotasAlumnoUseCase,
    ListarCuotasAlumnoUseCase,
    ListarMorosidadUseCase,
    RegistrarPagoUseCase,
    AnularPagoUseCase,
    ListarPagosUseCase,
    ResumenFinancieroUseCase,
  ],
  controllers: [TesoreriaController],
})
export class TesoreriaModule {}
