import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  NotaActividadRepository,
  RegistrarNotaProps,
  RegistrarNotaBulkItem,
  NotaConActividad,
} from '../../domain/repositories/nota-actividad.repository';
import { NotaActividad } from '../../domain/entities/nota-actividad.entity';
import { AcademicoMapper } from './academico.mapper';

@Injectable()
export class PrismaNotaActividadRepository implements NotaActividadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(props: RegistrarNotaProps): Promise<NotaActividad> {
    const { motivo, ...notaData } = props;

    const raw = await this.prisma.$transaction(async (tx) => {
      const anterior = await tx.notaActividad.findUnique({
        where: { actividadId_alumnoId: { actividadId: props.actividadId, alumnoId: props.alumnoId } },
      });

      const nota = await tx.notaActividad.upsert({
        where:  { actividadId_alumnoId: { actividadId: notaData.actividadId, alumnoId: notaData.alumnoId } },
        create: notaData,
        update: {
          puntaje:         notaData.puntaje,
          observacion:     notaData.observacion ?? null,
          calificadoPorId: notaData.calificadoPorId,
        },
      });

      await tx.auditoriaNota.create({
        data: {
          notaActividadId: nota.id,
          puntajeAnterior: anterior?.puntaje ?? null,
          puntajeNuevo:    notaData.puntaje,
          modificadoPorId: notaData.calificadoPorId,
          motivo:          motivo ?? null,
        },
      });

      return nota;
    });

    return AcademicoMapper.notaActividadToDomain(raw);
  }

  async upsertBulk(
    actividadId:     string,
    items:           RegistrarNotaBulkItem[],
    calificadoPorId: string,
  ): Promise<NotaActividad[]> {
    const notas = await this.prisma.$transaction(async (tx) => {
      const anteriores = await tx.notaActividad.findMany({
        where: { actividadId, alumnoId: { in: items.map(i => i.alumnoId) } },
      });
      const anteriorMap = new Map(anteriores.map(a => [a.alumnoId, a.puntaje]));

      const results: NotaActividad[] = [];

      for (const item of items) {
        const nota = await tx.notaActividad.upsert({
          where:  { actividadId_alumnoId: { actividadId, alumnoId: item.alumnoId } },
          create: { actividadId, alumnoId: item.alumnoId, puntaje: item.puntaje, observacion: item.observacion ?? null, calificadoPorId },
          update: { puntaje: item.puntaje, observacion: item.observacion ?? null, calificadoPorId },
        });

        await tx.auditoriaNota.create({
          data: {
            notaActividadId: nota.id,
            puntajeAnterior: anteriorMap.get(item.alumnoId) ?? null,
            puntajeNuevo:    item.puntaje,
            modificadoPorId: calificadoPorId,
          },
        });

        results.push(AcademicoMapper.notaActividadToDomain(nota));
      }

      return results;
    });

    return notas;
  }

  async buscarPorActividadYAlumno(actividadId: string, alumnoId: string): Promise<NotaActividad | null> {
    const raw = await this.prisma.notaActividad.findUnique({
      where: { actividadId_alumnoId: { actividadId, alumnoId } },
    });
    return raw ? AcademicoMapper.notaActividadToDomain(raw) : null;
  }

  async listarPorActividad(actividadId: string): Promise<NotaActividad[]> {
    const rows = await this.prisma.notaActividad.findMany({ where: { actividadId } });
    return rows.map(AcademicoMapper.notaActividadToDomain);
  }

  async listarPorAlumnoYAsignacion(alumnoId: string, docenteAsignacionId: string): Promise<NotaActividad[]> {
    const rows = await this.prisma.notaActividad.findMany({
      where:   { alumnoId, actividad: { docenteAsignacionId } },
      orderBy: { actividad: { createdAt: 'asc' } },
    });
    return rows.map(AcademicoMapper.notaActividadToDomain);
  }

  async listarPorAlumnoYPeriodo(
    alumnoId:            string,
    docenteAsignacionId: string,
    periodoId:           string,
  ): Promise<NotaConActividad[]> {
    const rows = await this.prisma.notaActividad.findMany({
      where:   { alumnoId, actividad: { docenteAsignacionId, periodoId } },
      include: { actividad: { select: { id: true, categoriaId: true, puntajeMaximo: true, pesoEnCategoria: true, docenteAsignacionId: true, periodoId: true, titulo: true, descripcion: true, fechaLimite: true, activo: true, createdAt: true, updatedAt: true } } },
    });

    return rows.map(r => ({
      nota:        AcademicoMapper.notaActividadToDomain(r),
      actividad:   AcademicoMapper.actividadToDomain(r.actividad),
      categoriaId: r.actividad.categoriaId,
    }));
  }
}
