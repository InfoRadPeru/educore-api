import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  HorarioRepository,
  AgregarBloqueProps,
  ActualizarBloqueProps,
  HorarioSeccionConBloques,
  HorarioBloqueConDetalle,
} from '../../domain/repositories/horario.repository';
import { HorarioSeccion, EstadoHorario } from '../../domain/entities/horario-seccion.entity';
import { HorarioBloque, DiaSemana } from '../../domain/entities/horario-bloque.entity';
import { HorarioMapper } from './horario.mapper';

@Injectable()
export class PrismaHorarioRepository implements HorarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Horario ─────────────────────────────────────────────────────────────

  async crearHorario(
    seccionId: string,
    añoAcademico: number,
    generadoAuto: boolean,
  ): Promise<HorarioSeccion> {
    const raw = await this.prisma.horarioSeccion.create({
      data: { seccionId, añoAcademico, generadoAuto },
    });
    return HorarioMapper.horarioToEntity(raw);
  }

  async buscarHorarioPorSeccion(
    seccionId: string,
    añoAcademico: number,
  ): Promise<HorarioSeccion | null> {
    const raw = await this.prisma.horarioSeccion.findUnique({
      where: { seccionId_añoAcademico: { seccionId, añoAcademico } },
    });
    return raw ? HorarioMapper.horarioToEntity(raw) : null;
  }

  async buscarHorarioPorId(id: string): Promise<HorarioSeccion | null> {
    const raw = await this.prisma.horarioSeccion.findUnique({ where: { id } });
    return raw ? HorarioMapper.horarioToEntity(raw) : null;
  }

  async listarHorariosPorColegio(
    colegioId: string,
    añoAcademico: number,
  ): Promise<HorarioSeccion[]> {
    const rows = await this.prisma.horarioSeccion.findMany({
      where: {
        añoAcademico,
        seccion: { colegioGrado: { colegioNivel: { colegioId } } },
      },
      orderBy: [
        { seccion: { colegioGrado: { colegioNivel: { nivelMaestro: { orden: 'asc' } } } } },
        { seccion: { nombre: 'asc' } },
      ],
    });
    return rows.map(HorarioMapper.horarioToEntity);
  }

  async cambiarEstadoHorario(id: string, estado: EstadoHorario): Promise<HorarioSeccion> {
    const raw = await this.prisma.horarioSeccion.update({ where: { id }, data: { estado } });
    return HorarioMapper.horarioToEntity(raw);
  }

  async eliminarHorario(id: string): Promise<void> {
    await this.prisma.horarioSeccion.delete({ where: { id } });
  }

  // ─── Bloques ──────────────────────────────────────────────────────────────

  async obtenerHorarioConBloques(horarioSeccionId: string): Promise<HorarioSeccionConBloques | null> {
    const horario = await this.prisma.horarioSeccion.findUnique({
      where: { id: horarioSeccionId },
    });
    if (!horario) return null;

    const bloquesRaw = await this.prisma.horarioBloque.findMany({
      where: { horarioSeccionId },
      include: {
        franjaHoraria: true,
        docenteAsignacion: {
          include: {
            docente: { include: { persona: true } },
            colegioAsignatura: { include: { asignaturaMaestra: true } },
          },
        },
      },
      orderBy: [
        { diaSemana: 'asc' },
        { franjaHoraria: { orden: 'asc' } },
      ],
    });

    const bloques: HorarioBloqueConDetalle[] = bloquesRaw.map(b => {
      const base = HorarioMapper.bloqueToEntity(b);
      const asignaturaNombre = b.docenteAsignacion.colegioAsignatura.nombre
        ?? b.docenteAsignacion.colegioAsignatura.asignaturaMaestra.nombre;
      const docente = b.docenteAsignacion.docente;
      const docenteNombre = `${docente.persona.nombres} ${docente.persona.apellidos}`;

      return Object.assign(Object.create(Object.getPrototypeOf(base)), base, {
        asignaturaNombre,
        docenteNombre,
        franjaHoraInicio: b.franjaHoraria.horaInicio,
        franjaHoraFin:    b.franjaHoraria.horaFin,
        franjaNombre:     b.franjaHoraria.nombre,
      }) as HorarioBloqueConDetalle;
    });

    return { horario: HorarioMapper.horarioToEntity(horario), bloques };
  }

  async agregarBloque(props: AgregarBloqueProps): Promise<HorarioBloque> {
    const raw = await this.prisma.horarioBloque.create({
      data: {
        horarioSeccionId:    props.horarioSeccionId,
        docenteAsignacionId: props.docenteAsignacionId,
        franjaHorariaId:     props.franjaHorariaId,
        diaSemana:           props.diaSemana,
        aula:                props.aula,
      },
    });
    return HorarioMapper.bloqueToEntity(raw);
  }

  async agregarBloques(bloques: AgregarBloqueProps[]): Promise<HorarioBloque[]> {
    if (bloques.length === 0) return [];
    const creados = await this.prisma.$transaction(
      bloques.map(b =>
        this.prisma.horarioBloque.create({
          data: {
            horarioSeccionId:    b.horarioSeccionId,
            docenteAsignacionId: b.docenteAsignacionId,
            franjaHorariaId:     b.franjaHorariaId,
            diaSemana:           b.diaSemana,
            aula:                b.aula,
          },
        }),
      ),
    );
    return creados.map(HorarioMapper.bloqueToEntity);
  }

  async buscarBloque(id: string): Promise<HorarioBloque | null> {
    const raw = await this.prisma.horarioBloque.findUnique({ where: { id } });
    return raw ? HorarioMapper.bloqueToEntity(raw) : null;
  }

  async actualizarBloque(id: string, props: ActualizarBloqueProps): Promise<HorarioBloque> {
    const raw = await this.prisma.horarioBloque.update({
      where: { id },
      data: {
        ...(props.docenteAsignacionId !== undefined && { docenteAsignacionId: props.docenteAsignacionId }),
        ...(props.franjaHorariaId     !== undefined && { franjaHorariaId:     props.franjaHorariaId }),
        ...(props.diaSemana           !== undefined && { diaSemana:           props.diaSemana }),
        ...(props.aula                !== undefined && { aula:                props.aula }),
      },
    });
    return HorarioMapper.bloqueToEntity(raw);
  }

  async eliminarBloque(id: string): Promise<void> {
    await this.prisma.horarioBloque.delete({ where: { id } });
  }

  async eliminarBloquesPorHorario(horarioSeccionId: string): Promise<void> {
    await this.prisma.horarioBloque.deleteMany({ where: { horarioSeccionId } });
  }

  // ─── Conflictos ───────────────────────────────────────────────────────────

  async verificarConflictoSeccion(
    horarioSeccionId: string,
    dia: DiaSemana,
    franjaHorariaId: string,
    excluirBloqueId?: string,
  ): Promise<boolean> {
    const count = await this.prisma.horarioBloque.count({
      where: {
        horarioSeccionId,
        diaSemana: dia,
        franjaHorariaId,
        ...(excluirBloqueId && { id: { not: excluirBloqueId } }),
      },
    });
    return count > 0;
  }

  async obtenerConflictosDocente(docenteId: string, añoAcademico: number) {
    const bloques = await this.prisma.horarioBloque.findMany({
      where: {
        docenteAsignacion: { docenteId, añoAcademico },
      },
      select: { diaSemana: true, franjaHorariaId: true },
    });
    return bloques.map(b => ({
      docenteId,
      dia: b.diaSemana as DiaSemana,
      franjaHorariaId: b.franjaHorariaId,
    }));
  }

  /**
   * Recibe el docenteAsignacionId y verifica si el docente de esa asignación
   * ya está ocupado en (dia, franja) dentro del mismo año académico.
   */
  async verificarConflictoDocente(
    docenteAsignacionId: string,
    dia: DiaSemana,
    franjaHorariaId: string,
    añoAcademico: number,
    excluirBloqueId?: string,
  ): Promise<boolean> {
    if (!docenteAsignacionId) return false;

    const asig = await this.prisma.docenteAsignacion.findUnique({
      where: { id: docenteAsignacionId },
      select: { docenteId: true },
    });
    if (!asig) return false;

    const count = await this.prisma.horarioBloque.count({
      where: {
        diaSemana: dia,
        franjaHorariaId,
        docenteAsignacion: { docenteId: asig.docenteId, añoAcademico },
        ...(excluirBloqueId && { id: { not: excluirBloqueId } }),
      },
    });
    return count > 0;
  }
}
