import { Asignacion } from "@modules/auth/domain/entities/asignacion.entity";
import { AsignacionRepository } from "@modules/auth/domain/repositories/asignacion.repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { AsignacionMapper } from "./asignacion.mapper";

const INCLUDE_COMPLETO = {
  colegio: { select: { nombre: true } },
  sede:    { select: { nombre: true } },
  rol:     { include: { permisos: { select: { permiso: true } } } },
} as const;

@Injectable()
export class PrismaAsignacionRepository implements AsignacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsuario(usuarioId: string): Promise<Asignacion[]> {
    const rows = await this.prisma.usuarioAsignacion.findMany({
      where:   { usuarioId },
      include: INCLUDE_COMPLETO,
    });
    return rows.map(r => AsignacionMapper.toDomain(r as any));
  }

  async findById(id: string): Promise<Asignacion | null> {
    const raw = await this.prisma.usuarioAsignacion.findUnique({
      where:   { id },
      include: INCLUDE_COMPLETO,
    });
    return raw ? AsignacionMapper.toDomain(raw as any) : null;
  }
}