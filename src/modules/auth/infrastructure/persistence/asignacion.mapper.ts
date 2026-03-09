import { Asignacion } from "@modules/auth/domain/entities/asignacion.entity";

// Tipo que representa el resultado de la query con includes
type AsignacionPrisma = {
  id: string; usuarioId: string; colegioId: string; sedeId: string | null;
  rolId: string; activo: boolean;
  colegio: { nombre: string };
  sede:    { nombre: string } | null;
  rol:     { nombre: string; esSistema: boolean; permisos: { permiso: string }[] };
};

export class AsignacionMapper {
  static toDomain(raw: AsignacionPrisma): Asignacion {
    return Asignacion.reconstitute({
      id:            raw.id,
      usuarioId:     raw.usuarioId,
      colegioId:     raw.colegioId,
      colegioNombre: raw.colegio.nombre,
      sedeId:        raw.sedeId,
      sedeNombre:    raw.sede?.nombre ?? null,
      rolId:         raw.rolId,
      rolNombre:     raw.rol.nombre,
      esSistema:     raw.rol.esSistema,
      permisos:      raw.rol.permisos.map(p => p.permiso),
      activo:        raw.activo,
    });
  }
}