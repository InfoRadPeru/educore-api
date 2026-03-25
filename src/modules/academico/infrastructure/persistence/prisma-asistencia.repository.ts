import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  AsistenciaRepository,
  RegistrarAsistenciaProps,
} from '../../domain/repositories/asistencia.repository';
import { Asistencia } from '../../domain/entities/asistencia.entity';
import { AcademicoMapper } from './academico.mapper';

function normalizarFecha(fecha: Date): Date {
  return new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
}

@Injectable()
export class PrismaAsistenciaRepository implements AsistenciaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(props: RegistrarAsistenciaProps): Promise<Asistencia> {
    const fecha = normalizarFecha(props.fecha);
    const raw = await this.prisma.asistencia.upsert({
      where:  { docenteAsignacionId_alumnoId_fecha: { docenteAsignacionId: props.docenteAsignacionId, alumnoId: props.alumnoId, fecha } },
      create: { ...props, fecha },
      update: { estado: props.estado as any, observacion: props.observacion ?? null, registradoPorId: props.registradoPorId },
    });
    return AcademicoMapper.asistenciaToDomain(raw);
  }

  async upsertBulk(
    docenteAsignacionId: string,
    fecha:               Date,
    registros:           Omit<RegistrarAsistenciaProps, 'docenteAsignacionId' | 'fecha'>[],
  ): Promise<Asistencia[]> {
    const fechaNorm = normalizarFecha(fecha);
    const results = await this.prisma.$transaction(
      registros.map(r =>
        this.prisma.asistencia.upsert({
          where:  { docenteAsignacionId_alumnoId_fecha: { docenteAsignacionId, alumnoId: r.alumnoId, fecha: fechaNorm } },
          create: { docenteAsignacionId, fecha: fechaNorm, alumnoId: r.alumnoId, estado: r.estado as any, observacion: r.observacion ?? null, registradoPorId: r.registradoPorId },
          update: { estado: r.estado as any, observacion: r.observacion ?? null, registradoPorId: r.registradoPorId },
        }),
      ),
    );
    return results.map(AcademicoMapper.asistenciaToDomain);
  }

  async buscarPorAsignacionAlumnoFecha(
    docenteAsignacionId: string,
    alumnoId:            string,
    fecha:               Date,
  ): Promise<Asistencia | null> {
    const raw = await this.prisma.asistencia.findUnique({
      where: { docenteAsignacionId_alumnoId_fecha: { docenteAsignacionId, alumnoId, fecha: normalizarFecha(fecha) } },
    });
    return raw ? AcademicoMapper.asistenciaToDomain(raw) : null;
  }

  async listarPorAsignacionYFecha(docenteAsignacionId: string, fecha: Date): Promise<Asistencia[]> {
    const rows = await this.prisma.asistencia.findMany({
      where:   { docenteAsignacionId, fecha: normalizarFecha(fecha) },
      orderBy: { alumnoId: 'asc' },
    });
    return rows.map(AcademicoMapper.asistenciaToDomain);
  }

  async listarPorAlumnoYAsignacion(alumnoId: string, docenteAsignacionId: string): Promise<Asistencia[]> {
    const rows = await this.prisma.asistencia.findMany({
      where:   { alumnoId, docenteAsignacionId },
      orderBy: { fecha: 'asc' },
    });
    return rows.map(AcademicoMapper.asistenciaToDomain);
  }
}
