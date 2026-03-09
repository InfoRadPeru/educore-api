// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Implementación concreta de SedeRepository usando Prisma.
//
// PRINCIPIO: Dependency Inversion.
//   Los use cases dependen de SedeRepository (interfaz de dominio).
//   Este archivo solo lo conoce el módulo en el momento del ensamblado.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Sede } from '@modules/colegios/domain/entities/sede.entity';
import {
  ActualizarSedeProps,
  CrearSedeProps,
  SedeRepository,
} from '@modules/colegios/domain/repositories/sede.repository';
import { SedeMapper } from './sede.mapper';

@Injectable()
export class PrismaSedeRepository implements SedeRepository {

  constructor(private readonly prisma: PrismaService) {}

  async buscarPorColegio(colegioId: string): Promise<Sede[]> {
    const rows = await this.prisma.sede.findMany({
      where:   { colegioId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(SedeMapper.toDomain);
  }

  async buscarPorId(id: string, colegioId: string): Promise<Sede | null> {
    const raw = await this.prisma.sede.findFirst({
      where: { id, colegioId },
    });
    return raw ? SedeMapper.toDomain(raw) : null;
  }

  async contarActivas(colegioId: string): Promise<number> {
    return this.prisma.sede.count({
      where: { colegioId, activo: true },
    });
  }

  async crear(props: CrearSedeProps): Promise<Sede> {
    const raw = await this.prisma.sede.create({
      data: {
        colegioId: props.colegioId,
        nombre:    props.nombre,
        direccion: props.direccion,
        telefono:  props.telefono,
        email:     props.email,
      },
    });
    return SedeMapper.toDomain(raw);
  }

  async actualizar(id: string, props: ActualizarSedeProps): Promise<Sede> {
    const raw = await this.prisma.sede.update({
      where: { id },
      data: {
        ...(props.nombre    !== undefined && { nombre:    props.nombre    }),
        ...(props.direccion !== undefined && { direccion: props.direccion }),
        ...(props.telefono  !== undefined && { telefono:  props.telefono  }),
        ...(props.email     !== undefined && { email:     props.email     }),
      },
    });
    return SedeMapper.toDomain(raw);
  }

  async cambiarEstado(id: string, activo: boolean): Promise<Sede> {
    const raw = await this.prisma.sede.update({
      where: { id },
      data:  { activo },
    });
    return SedeMapper.toDomain(raw);
  }
}