import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  BoletinResponseDto,
  AlumnoInfoDto,
  PeriodoBoletinDto,
  AsignaturaBoletinDto,
  AsistenciaResumenDto,
} from './dtos/boletin.dto';

@Injectable()
export class BoletinQueryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera el boletín completo para un alumno en un año académico.
   * soloPublicados=true filtra solo periodos publicados (para apoderado).
   */
  async obtenerBoletin(
    alumnoId: string,
    año: number,
    soloPublicados: boolean,
  ): Promise<BoletinResponseDto | null> {
    // 1. Alumno con persona + matrícula activa del año
    const perfil = await this.prisma.perfilAlumno.findUnique({
      where: { id: alumnoId },
      include: {
        persona: true,
        matriculas: {
          where: { añoAcademico: año },
          include: {
            seccion: {
              include: {
                colegioGrado: {
                  include: {
                    gradoMaestro: { include: { nivelMaestro: true } },
                    colegioNivel: {
                      include: {
                        colegio: { include: { configuracion: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!perfil) return null;

    const matricula = perfil.matriculas[0];
    if (!matricula) return null;

    const seccion        = matricula.seccion;
    const colegioGrado   = seccion.colegioGrado;
    const gradoMaestro   = colegioGrado.gradoMaestro;
    const nivel          = gradoMaestro.nivelMaestro;
    const colegio        = colegioGrado.colegioNivel.colegio;
    const colegioId      = perfil.colegioId;
    const seccionId      = seccion.id;

    const notaMaxima = colegio.configuracion?.notaMaxima   ?? 20;
    const decimales  = colegio.configuracion?.decimalesNota ?? 1;

    // 2. Periodos del colegio para ese año
    const todosPeriodos = await this.prisma.periodoEvaluacion.findMany({
      where: { colegioId, añoAcademico: año },
      orderBy: { numero: 'asc' },
    });

    // 3. Filtrar periodos publicados si aplica
    let periodos = todosPeriodos;
    if (soloPublicados) {
      const publicaciones = await this.prisma.publicacionBoletin.findMany({
        where: { seccionId, periodoId: { in: todosPeriodos.map(p => p.id) } },
        select: { periodoId: true },
      });
      const idsPublicados = new Set(publicaciones.map(p => p.periodoId));
      periodos = todosPeriodos.filter(p => idsPublicados.has(p.id));
    }

    // 4. Asignaciones de la sección ese año
    const asignaciones = await this.prisma.docenteAsignacion.findMany({
      where: { seccionId, añoAcademico: año },
      include: { colegioAsignatura: { include: { asignaturaMaestra: true } } },
    });

    // 5. Construir periodos del boletín
    const periodosBoletin: PeriodoBoletinDto[] = [];

    for (const periodo of periodos) {
      const asignaturasBoletin: AsignaturaBoletinDto[] = [];

      for (const asig of asignaciones) {
        // Nota final del periodo
        const notaPeriodo = await this.prisma.notaPeriodo.findUnique({
          where: {
            alumnoId_docenteAsignacionId_periodoId: {
              alumnoId,
              docenteAsignacionId: asig.id,
              periodoId: periodo.id,
            },
          },
        });

        // Asistencias en el rango del periodo
        const asistencias = await this.prisma.asistencia.findMany({
          where: {
            docenteAsignacionId: asig.id,
            alumnoId,
            fecha: { gte: periodo.fechaInicio, lte: periodo.fechaFin },
          },
          select: { estado: true },
        });

        const resumen: AsistenciaResumenDto = {
          total:        asistencias.length,
          presentes:    asistencias.filter(a => a.estado === 'PRESENTE').length,
          ausentes:     asistencias.filter(a => a.estado === 'AUSENTE').length,
          tardanzas:    asistencias.filter(a => a.estado === 'TARDANZA').length,
          justificados: asistencias.filter(a => a.estado === 'JUSTIFICADO').length,
        };

        const nombreAsig = asig.colegioAsignatura.nombre
          ?? asig.colegioAsignatura.asignaturaMaestra.nombre;

        asignaturasBoletin.push({
          asignaturaId: asig.colegioAsignatura.id,
          nombre:       nombreAsig,
          notaFinal:    notaPeriodo
            ? parseFloat(notaPeriodo.notaFinal.toFixed(decimales))
            : null,
          asistencias: resumen,
        });
      }

      // Promedio del periodo
      const notasDisponibles = asignaturasBoletin
        .map(a => a.notaFinal)
        .filter((n): n is number => n !== null);

      const promedio = notasDisponibles.length > 0
        ? parseFloat(
            (notasDisponibles.reduce((s, n) => s + n, 0) / notasDisponibles.length)
              .toFixed(decimales),
          )
        : null;

      periodosBoletin.push({
        periodoId:   periodo.id,
        nombre:      periodo.nombre,
        numero:      periodo.numero,
        fechaInicio: periodo.fechaInicio.toISOString().split('T')[0],
        fechaFin:    periodo.fechaFin.toISOString().split('T')[0],
        asignaturas: asignaturasBoletin,
        promedio,
      });
    }

    // 6. Promedio anual
    const promediosPeriodos = periodosBoletin
      .map(p => p.promedio)
      .filter((n): n is number => n !== null);

    const promedioAnual = promediosPeriodos.length > 0
      ? parseFloat(
          (promediosPeriodos.reduce((s, n) => s + n, 0) / promediosPeriodos.length)
            .toFixed(decimales),
        )
      : null;

    const alumnoInfo: AlumnoInfoDto = {
      id:              perfil.id,
      nombres:         perfil.persona.nombres,
      apellidos:       perfil.persona.apellidos,
      codigoMatricula: perfil.codigoMatricula,
      seccion:         seccion.nombre,
      grado:           gradoMaestro.nombre,
      nivel:           nivel.nombre,
    };

    return { alumno: alumnoInfo, año, periodos: periodosBoletin, promedioAnual };
  }
}
