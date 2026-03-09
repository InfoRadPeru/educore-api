// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Mapper de Nivel — convierte el modelo Prisma a entidad de dominio.
//
// COMPLEJIDAD DE NIVEL:
//   Un Nivel en dominio combina datos de dos tablas:
//   - ColegioNivel (estado de activación por colegio)
//   - NivelMaestro (nombre y orden del catálogo global)
//   El mapper maneja esa combinación de forma explícita.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Nivel } from '@modules/colegios/domain/entities/nivel.entity';

export interface NivelPrismaRaw {
  id:             string;
  nivelMaestroId: string;
  activo:         boolean;
  nivelMaestro: {
    nombre: string;
    orden:  number;
  };
  turnos: { turno: string }[];
}

export class NivelMapper {
  static toDomain(raw: NivelPrismaRaw): Nivel {
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