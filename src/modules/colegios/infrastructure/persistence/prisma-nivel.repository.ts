// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Implementación concreta de NivelRepository usando Prisma.
//
// LÓGICA DE buscarTodos:
//   Trae los NivelMaestro activos del catálogo global y los combina
//   con el estado de activación del colegio (ColegioNivel).
//   Si el colegio aún no activó un nivel, se retorna como inactivo
//   con id vacío — el use case decide cómo manejarlo.
//
// NOTA SOBRE id VACÍO:
//   Este es el problema B5 del listado de revisión. Por ahora se
//   mantiene igual para no romper el comportamiento existente.
//   Se corregirá cuando se ataque ese problema específicamente.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Nivel } from '@modules/colegios/domain/entities/nivel.entity';
import { NivelRepository } from '@modules/colegios/domain/repositories/nivel.repository';
import { NivelMapper } from './nivel.mapper';

const INCLUDE_NIVEL = {
  nivelMaestro: true,
  turnos:       true,
} as const;

@Injectable()
export class PrismaNivelRepository implements NivelRepository {

  constructor(private readonly prisma: PrismaService) {}

  async buscarTodos(colegioId: string): Promise<Nivel[]> {
    const maestros = await this.prisma.nivelMaestro.findMany({
      where:   { activo: true },
      orderBy: { orden: 'asc' },
      include: {
        colegioNiveles: {
          where:   { colegioId },
          include: INCLUDE_NIVEL,
        }, 
      },
    });

    return maestros.map(maestro => {
      const colegioNivel = maestro.colegioNiveles[0];

      // Nivel disponible pero no activado por el colegio aún
      if (!colegioNivel) {
        return Nivel.reconstitute({
          id:             '',
          nivelMaestroId: maestro.id,
          nombre:         maestro.nombre,
          orden:          maestro.orden,
          activo:         false,
          turnos:         [],
        });
      }

      return NivelMapper.toDomain(colegioNivel as any);
    });
  }

  async buscarPorNivelMaestro(nivelMaestroId: string, colegioId: string): Promise<Nivel | null> {
    const raw = await this.prisma.colegioNivel.findUnique({
      where:   { colegioId_nivelMaestroId: { colegioId, nivelMaestroId } },
      include: INCLUDE_NIVEL,
    });
    return raw ? NivelMapper.toDomain(raw as any) : null;
  }

  async activar(colegioId: string, nivelMaestroId: string): Promise<Nivel> {
    const raw = await this.prisma.colegioNivel.create({
      data:    { colegioId, nivelMaestroId, activo: true },
      include: INCLUDE_NIVEL,
    });
    return NivelMapper.toDomain(raw as any);
  }

  async cambiarEstado(nivelId: string, activo: boolean): Promise<Nivel> {
    const raw = await this.prisma.colegioNivel.update({
      where:   { id: nivelId },
      data:    { activo },
      include: INCLUDE_NIVEL,
    });
    return NivelMapper.toDomain(raw as any);
  }
}