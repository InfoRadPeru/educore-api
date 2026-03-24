import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';

import { HorariosController } from './infrastructure/controllers/horarios.controller';

import { FRANJA_HORARIA_REPOSITORY }           from './domain/repositories/franja-horaria.repository';
import { HORARIO_REPOSITORY }                  from './domain/repositories/horario.repository';
import { PrismaFranjaHorariaRepository }       from './infrastructure/persistence/prisma-franja-horaria.repository';
import { PrismaHorarioRepository }             from './infrastructure/persistence/prisma-horario.repository';

import { GeneradorHorarioService }             from './application/generador-horario.service';

import { CrearFranjaUseCase }                  from './application/use-cases/crear-franja.use-case';
import { ListarFranjasUseCase }                from './application/use-cases/listar-franjas.use-case';
import { ActualizarFranjaUseCase }             from './application/use-cases/actualizar-franja.use-case';
import { EliminarFranjaUseCase }               from './application/use-cases/eliminar-franja.use-case';
import { CrearHorarioSeccionUseCase }          from './application/use-cases/crear-horario-seccion.use-case';
import { ObtenerHorarioSeccionUseCase }        from './application/use-cases/obtener-horario-seccion.use-case';
import { ListarHorariosColegioUseCase }        from './application/use-cases/listar-horarios-colegio.use-case';
import { PublicarHorarioUseCase }              from './application/use-cases/publicar-horario.use-case';
import { AgregarBloqueUseCase }                from './application/use-cases/agregar-bloque.use-case';
import { ActualizarBloqueUseCase }             from './application/use-cases/actualizar-bloque.use-case';
import { EliminarBloqueUseCase }               from './application/use-cases/eliminar-bloque.use-case';
import { GenerarHorarioAutoUseCase }           from './application/use-cases/generar-horario-auto.use-case';
import { GenerarHorarioColegioUseCase }        from './application/use-cases/generar-horario-colegio.use-case';
import { ObtenerHorarioDocenteUseCase }        from './application/use-cases/obtener-horario-docente.use-case';

@Module({
  imports: [AuthModule],
  controllers: [HorariosController],
  providers: [
    { provide: FRANJA_HORARIA_REPOSITORY, useClass: PrismaFranjaHorariaRepository },
    { provide: HORARIO_REPOSITORY,        useClass: PrismaHorarioRepository        },
    GeneradorHorarioService,
    CrearFranjaUseCase,
    ListarFranjasUseCase,
    ActualizarFranjaUseCase,
    EliminarFranjaUseCase,
    CrearHorarioSeccionUseCase,
    ObtenerHorarioSeccionUseCase,
    ListarHorariosColegioUseCase,
    PublicarHorarioUseCase,
    AgregarBloqueUseCase,
    ActualizarBloqueUseCase,
    EliminarBloqueUseCase,
    GenerarHorarioAutoUseCase,
    GenerarHorarioColegioUseCase,
    ObtenerHorarioDocenteUseCase,
  ],
})
export class HorariosModule {}
