// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Mapper de Sede — convierte el modelo Prisma a entidad de dominio.
//
// QUÉ CAMBIÓ vs versión anterior:
//   Antes estaba mezclado en ColegioMapper junto con sedeToDomain
//   y nivelToDomain. Ahora cada mapper tiene su propio archivo.
//
// POR QUÉ INTERFACES EXPLÍCITAS EN VEZ DE TYPE GYMNASTICS:
//   Antes: type SedeRaw = Awaited<ReturnType<PrismaClient['sede']['findUniqueOrThrow']>>
//   El problema: ese tipo incluye TODOS los campos de Prisma, incluyendo
//   los que no usamos. Si Prisma cambia internamente, el tipo cambia.
//
//   Ahora: interfaz explícita con solo los campos que necesitamos.
//   Más legible, más estable, desacoplado de la firma interna de Prisma.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Sede } from '@modules/colegios/domain/entities/sede.entity';

// Interfaz explícita — solo los campos que el mapper necesita
// No acoplada a la firma interna de PrismaClient
export interface SedePrismaRaw {
  id:        string;
  colegioId: string;
  nombre:    string;
  direccion: string;
  telefono:  string | null;
  email:     string | null;
  activo:    boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class SedeMapper {
  static toDomain(raw: SedePrismaRaw): Sede {
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
}