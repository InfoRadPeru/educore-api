import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  FranjaHorariaRepository,
  CrearFranjaProps,
  ActualizarFranjaProps,
} from '../../domain/repositories/franja-horaria.repository';
import { FranjaHoraria } from '../../domain/entities/franja-horaria.entity';
import { HorarioMapper } from './horario.mapper';

@Injectable()
export class PrismaFranjaHorariaRepository implements FranjaHorariaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(props: CrearFranjaProps): Promise<FranjaHoraria> {
    const raw = await this.prisma.franjaHoraria.create({ data: props });
    return HorarioMapper.franjaToEntity(raw);
  }

  async buscarPorId(id: string): Promise<FranjaHoraria | null> {
    const raw = await this.prisma.franjaHoraria.findUnique({ where: { id } });
    return raw ? HorarioMapper.franjaToEntity(raw) : null;
  }

  async listarPorColegio(colegioId: string): Promise<FranjaHoraria[]> {
    const rows = await this.prisma.franjaHoraria.findMany({
      where: { colegioId },
      orderBy: { orden: 'asc' },
    });
    return rows.map(HorarioMapper.franjaToEntity);
  }

  async actualizar(id: string, props: ActualizarFranjaProps): Promise<FranjaHoraria> {
    const raw = await this.prisma.franjaHoraria.update({ where: { id }, data: props });
    return HorarioMapper.franjaToEntity(raw);
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.franjaHoraria.delete({ where: { id } });
  }

  async tieneBloques(id: string): Promise<boolean> {
    const count = await this.prisma.horarioBloque.count({ where: { franjaHorariaId: id } });
    return count > 0;
  }
}
