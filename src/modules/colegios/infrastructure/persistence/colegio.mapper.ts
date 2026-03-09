// Qué es: Convierte modelos Prisma a entidades de dominio.
// Patrón: Mapper Pattern — separa la representación de BD de la representación de dominio.
// Principio SOLID: Single Responsibility — solo transforma datos, sin lógica de negocio.
// Por qué aquí y no en el repositorio: El repositorio orquesta, el mapper transforma. Responsabilidades separadas.

import { Colegio } from '@modules/colegios/domain/entities/colegio.entity';
import { Nivel } from '@modules/colegios/domain/entities/nivel.entity';
import { Sede } from '@modules/colegios/domain/entities/sede.entity';
import { PrismaClient } from 'src/generated/prisma/client';

type ColegioRaw = Awaited<ReturnType<PrismaClient['colegio']['findUniqueOrThrow']>>;
type SedeRaw    = Awaited<ReturnType<PrismaClient['sede']['findUniqueOrThrow']>>;

type ColegioNivelRaw = Awaited<ReturnType<PrismaClient['colegioNivel']['findUniqueOrThrow']>> & {
  nivelMaestro: { nombre: string; orden: number };
  turnos:       { turno: string }[];
};

export class ColegioMapper {
  static toDomain(raw: ColegioRaw): Colegio {
    return Colegio.reconstitute({
      id:          raw.id,
      nombre:      raw.nombre,
      ruc:         raw.ruc,
      direccion:   raw.direccion,
      telefono:    raw.telefono,
      email:       raw.email,
      estado:      raw.estado as any,
      plan:        raw.plan as any,
      planVenceEn: raw.planVenceEn,
      createdAt:   raw.createdAt,
      updatedAt:   raw.updatedAt,
    });
  }

  static sedeToDomain(raw: SedeRaw): Sede {
    return Sede.reconstitute({
      id:        raw.id,
      colegioId: raw.colegioId,
      nombre:    raw.nombre,
      direccion: raw.direccion,
      telefono:  raw.telefono,
      email:     raw.email,
      activo:    raw.activo,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static nivelToDomain(raw: ColegioNivelRaw): Nivel {
    return Nivel.reconstitute({
      id:             raw.id,
      nivelMaestroId: raw.nivelMaestroId,
      nombre:         raw.nivelMaestro.nombre,
      orden:          raw.nivelMaestro.orden,
      activo:         raw.activo,
      turnos:         raw.turnos.map(t => t.turno),
    });
  }
}