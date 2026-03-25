import { AsignaturaMaestra, ColegioAsignatura } from '../../domain/entities/asignatura.entity';
import { GradoAsignatura } from '../../domain/entities/grado-asignatura.entity';

export type AsignaturaMaestraPrisma = {
  id: string; nombre: string; descripcion: string | null; activo: boolean;
};

export type ColegioAsignaturaPrisma = {
  id: string; colegioId: string; asignaturaMaestraId: string;
  nombre: string | null; activo: boolean;
  asignaturaMaestra: { nombre: string };
};

export type GradoAsignaturaPrisma = {
  id: string; colegioGradoId: string; colegioAsignaturaId: string;
  horasSemanales: number | null;
  createdAt: Date; updatedAt: Date;
  colegioAsignatura: { asignaturaMaestra: { nombre: string } };
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

  static gradoToDomain(raw: GradoAsignaturaPrisma): GradoAsignatura {
    return GradoAsignatura.reconstitute({
      id:                  raw.id,
      colegioGradoId:      raw.colegioGradoId,
      colegioAsignaturaId: raw.colegioAsignaturaId,
      asignaturaNombre:    raw.colegioAsignatura.asignaturaMaestra.nombre,
      horasSemanales:      raw.horasSemanales,
      createdAt:           raw.createdAt,
      updatedAt:           raw.updatedAt,
    });
  }
}
