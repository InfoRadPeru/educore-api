import { AsignaturaMaestra, ColegioAsignatura } from '../../domain/entities/asignatura.entity';

type AsignaturaMaestraPrisma = {
  id: string; nombre: string; descripcion: string | null; activo: boolean;
};

type ColegioAsignaturaPrisma = {
  id: string; colegioId: string; asignaturaMaestraId: string;
  nombre: string | null; activo: boolean;
  asignaturaMaestra: { nombre: string };
};

export class AsignaturaMapper {
  static maestraToDomain(raw: AsignaturaMaestraPrisma): AsignaturaMaestra {
    return AsignaturaMaestra.reconstitute({
      id:          raw.id,
      nombre:      raw.nombre,
      descripcion: raw.descripcion,
      activo:      raw.activo,
    });
  }

  static colegioToDomain(raw: ColegioAsignaturaPrisma): ColegioAsignatura {
    return ColegioAsignatura.reconstitute({
      id:                  raw.id,
      colegioId:           raw.colegioId,
      asignaturaMaestraId: raw.asignaturaMaestraId,
      nombreMaestro:       raw.asignaturaMaestra.nombre,
      nombreOverride:      raw.nombre,
      activo:              raw.activo,
    });
  }
}
