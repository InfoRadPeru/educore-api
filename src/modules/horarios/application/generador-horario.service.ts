import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { DiaSemana } from '../domain/entities/horario-bloque.entity';
import { AgregarBloqueProps } from '../domain/repositories/horario.repository';

const DIAS_LABORABLES: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

interface AsignacionInfo {
  docenteAsignacionId: string;
  docenteId:           string;
  horasSemanales:      number;
}

export interface ResultadoGeneracion {
  seccionId:      string;
  bloques:        AgregarBloqueProps[];
  horasNoColocadas: number;
}

@Injectable()
export class GeneradorHorarioService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera bloques para una o múltiples secciones.
   * El tracker de docentes es compartido entre secciones para evitar conflictos globales.
   */
  async generarParaSecciones(
    seccionIds: string[],
    añoAcademico: number,
    colegioId: string,
  ): Promise<ResultadoGeneracion[]> {
    // 1. Cargar franjas activas del colegio, ordenadas
    const franjas = await this.prisma.franjaHoraria.findMany({
      where: { colegioId, activo: true },
      orderBy: { orden: 'asc' },
    });

    if (franjas.length === 0) {
      return seccionIds.map(id => ({ seccionId: id, bloques: [], horasNoColocadas: 0 }));
    }

    // 2. Cargar conflictos existentes de horarios YA publicados del mismo año
    //    (para no pisarlos al generar nuevas secciones)
    const bloquesExistentes = await this.prisma.horarioBloque.findMany({
      where: {
        horarioSeccion: {
          estado: 'PUBLICADO',
          añoAcademico,
          seccion: { colegioGrado: { colegioNivel: { colegioId } } },
        },
      },
      include: { docenteAsignacion: { select: { docenteId: true } } },
    });

    // Tracker global: docenteId → Set<"dia_franjaId">
    const docenteOcupado = new Map<string, Set<string>>();

    for (const b of bloquesExistentes) {
      const key = `${b.diaSemana}_${b.franjaHorariaId}`;
      const docenteId = b.docenteAsignacion.docenteId;
      if (!docenteOcupado.has(docenteId)) docenteOcupado.set(docenteId, new Set());
      docenteOcupado.get(docenteId)!.add(key);
    }

    // 3. Generar por sección
    const resultados: ResultadoGeneracion[] = [];

    for (const seccionId of seccionIds) {
      const resultado = await this.generarParaSeccion(
        seccionId,
        añoAcademico,
        franjas,
        docenteOcupado,
      );
      resultados.push(resultado);

      // Actualizar el tracker global con los bloques recién generados
      for (const bloque of resultado.bloques) {
        const key = `${bloque.diaSemana}_${bloque.franjaHorariaId}`;
        // Necesitamos el docenteId de la asignación
        const asig = await this.prisma.docenteAsignacion.findUnique({
          where: { id: bloque.docenteAsignacionId },
          select: { docenteId: true },
        });
        if (asig) {
          if (!docenteOcupado.has(asig.docenteId)) docenteOcupado.set(asig.docenteId, new Set());
          docenteOcupado.get(asig.docenteId)!.add(key);
        }
      }
    }

    return resultados;
  }

  private async generarParaSeccion(
    seccionId: string,
    añoAcademico: number,
    franjas: { id: string; orden: number }[],
    docenteOcupado: Map<string, Set<string>>,
  ): Promise<ResultadoGeneracion> {
    // Cargar asignaciones de la sección con horasSemanales de GradoAsignatura
    const asignaciones = await this.prisma.docenteAsignacion.findMany({
      where: { seccionId, añoAcademico },
      include: {
        docente: { select: { id: true } },
        colegioAsignatura: true,
        seccion: { include: { colegioGrado: true } },
      },
    });

    // Obtener horasSemanales de GradoAsignatura
    const asignacionesInfo: AsignacionInfo[] = [];

    for (const a of asignaciones) {
      const gradoAsig = await this.prisma.gradoAsignatura.findUnique({
        where: {
          colegioGradoId_colegioAsignaturaId: {
            colegioGradoId:      a.seccion.colegioGradoId,
            colegioAsignaturaId: a.colegioAsignaturaId,
          },
        },
        select: { horasSemanales: true },
      });

      asignacionesInfo.push({
        docenteAsignacionId: a.id,
        docenteId:           a.docenteId,
        horasSemanales:      gradoAsig?.horasSemanales ?? 1,
      });
    }

    // Ordenar: más horas primero (más difíciles de colocar)
    asignacionesInfo.sort((a, b) => b.horasSemanales - a.horasSemanales);

    // Orden de slots: franja × día (distribuye una hora por día antes de repetir)
    const slotsOrdenados = this.generarOrdenSlots(franjas);

    // Tracker local de la sección: Set<"dia_franjaId">
    const seccionOcupada = new Set<string>();
    const bloques: AgregarBloqueProps[] = [];
    let horasNoColocadas = 0;

    for (const asig of asignacionesInfo) {
      let colocadas = 0;

      for (const slot of slotsOrdenados) {
        if (colocadas >= asig.horasSemanales) break;

        const key = `${slot.dia}_${slot.franjaId}`;
        const docenteSlots = docenteOcupado.get(asig.docenteId) ?? new Set();

        if (!seccionOcupada.has(key) && !docenteSlots.has(key)) {
          bloques.push({
            horarioSeccionId:    '', // se rellena al guardar
            docenteAsignacionId: asig.docenteAsignacionId,
            franjaHorariaId:     slot.franjaId,
            diaSemana:           slot.dia,
          });
          seccionOcupada.add(key);
          if (!docenteOcupado.has(asig.docenteId)) docenteOcupado.set(asig.docenteId, new Set());
          docenteOcupado.get(asig.docenteId)!.add(key);
          colocadas++;
        }
      }

      horasNoColocadas += Math.max(0, asig.horasSemanales - colocadas);
    }

    return { seccionId, bloques, horasNoColocadas };
  }

  /**
   * Orden de slots: iteramos por franja primero y luego por día.
   * Resultado: para cada franja, probamos todos los días.
   * Esto distribuye automáticamente una hora por día antes de repetir franjas.
   */
  private generarOrdenSlots(
    franjas: { id: string }[],
  ): { dia: DiaSemana; franjaId: string }[] {
    const slots: { dia: DiaSemana; franjaId: string }[] = [];
    for (const franja of franjas) {
      for (const dia of DIAS_LABORABLES) {
        slots.push({ dia, franjaId: franja.id });
      }
    }
    return slots;
  }
}
