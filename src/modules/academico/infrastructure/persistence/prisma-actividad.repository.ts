import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  ActividadRepository,
  CrearActividadProps,
  ActualizarActividadProps,
} from '../../domain/repositories/actividad.repository';
import { Actividad } from '../../domain/entities/actividad.entity';
import { AcademicoMapper } from './academico.mapper';

@Injectable()
export class PrismaActividadRepository implements ActividadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(props: CrearActividadProps): Promise<Actividad> {
    const raw = await this.prisma.actividad.create({ data: props });
    return AcademicoMapper.actividadToDomain(raw);
  }

  async buscarPorId(id: string): Promise<Actividad | null> {
    const raw = await this.prisma.actividad.findUnique({ where: { id } });
    return raw ? AcademicoMapper.actividadToDomain(raw) : null;
  }

  async listarPorAsignacionYPeriodo(docenteAsignacionId: string, periodoId: string): Promise<Actividad[]> {
    const rows = await this.prisma.actividad.findMany({
      where:   { docenteAsignacionId, periodoId, activo: true },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(AcademicoMapper.actividadToDomain);
  }

  async listarPorAsignacion(docenteAsignacionId: string): Promise<Actividad[]> {
    const rows = await this.prisma.actividad.findMany({
      where:   { docenteAsignacionId, activo: true },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(AcademicoMapper.actividadToDomain);
  }

  async tieneNotas(id: string): Promise<boolean> {
    const count = await this.prisma.notaActividad.count({ where: { actividadId: id } });
    return count > 0;
  }

  async actualizar(id: string, props: ActualizarActividadProps): Promise<Actividad> {
    const raw = await this.prisma.actividad.update({ where: { id }, data: props });
    return AcademicoMapper.actividadToDomain(raw);
  }

  async desactivar(id: string): Promise<void> {
    await this.prisma.actividad.update({ where: { id }, data: { activo: false } });
  }
}
