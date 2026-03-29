import { AuthModule }          from '@modules/auth/auth.module';
import { ColegiosModule }       from '@modules/colegios/colegios.module';
import { AlumnosModule }        from '@modules/alumnos/alumnos.module';
import { MatriculasModule }     from '@modules/matriculas/matriculas.module';
import { PostulacionesModule }  from '@modules/postulaciones/postulaciones.module';
import { PrematriculasModule }  from '@modules/prematriculas/prematriculas.module';
import { ApoderadosModule }     from '@modules/apoderados/apoderados.module';
import { DocentesModule }      from '@modules/docentes/docentes.module';
import { AsignaturasModule }   from '@modules/asignaturas/asignaturas.module';
import { AcademicoModule }     from '@modules/academico/academico.module';
import { BoletinModule }       from '@modules/boletin/boletin.module';
import { ComunicadosModule }   from '@modules/comunicados/comunicados.module';
import { HorariosModule }      from '@modules/horarios/horarios.module';
import { TesoreriaModule }      from '@modules/tesoreria/tesoreria.module';
import { NotificacionesModule } from '@modules/notificaciones/notificaciones.module';
import { PersonasModule }       from '@modules/personas/personas.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@shared/infrastructure/filters/http-exception.filter';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ColegiosModule,
    AlumnosModule,
    MatriculasModule,
    PostulacionesModule,
    PrematriculasModule,
    ApoderadosModule,
    DocentesModule,
    AsignaturasModule,
    AcademicoModule,
    BoletinModule,
    ComunicadosModule,
    HorariosModule,
    TesoreriaModule,
    NotificacionesModule,
    PersonasModule,
  ],
  providers: [
    {
      provide:  APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
