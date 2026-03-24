import { Docente, DocenteAsignacion } from '../../domain/entities/docente.entity';

type DocentePrisma = {
  id: string; personaId: string; colegioId: string; sedeId: string | null;
  especialidad: string | null; estado: string; createdAt: Date; updatedAt: Date;
  persona: {
    dni: string; nombres: string; apellidos: string; telefono: string | null;
    usuario: { id: string } | null;
  };
};

type AsignacionPrisma = {
  id: string; docenteId: string; seccionId: string;
  colegioAsignaturaId: string; añoAcademico: number;
  esTutor: boolean; createdAt: Date;
  colegioAsignatura: {
    nombre: string | null;
    asignaturaMaestra: { nombre: string };
  };
};

export class DocenteMapper {
  static toDomain(raw: DocentePrisma): Docente {
    return Docente.reconstitute({
      id:           raw.id,
      personaId:    raw.personaId,
      colegioId:    raw.colegioId,
      sedeId:       raw.sedeId,
      especialidad: raw.especialidad,
      estado:       raw.estado as any,
      dni:          raw.persona.dni,
      nombres:      raw.persona.nombres,
      apellidos:    raw.persona.apellidos,
      telefono:     raw.persona.telefono,
      usuarioId:    raw.persona.usuario?.id ?? null,
      createdAt:    raw.createdAt,
      updatedAt:    raw.updatedAt,
    });
  }

  static asignacionToDomain(raw: AsignacionPrisma): DocenteAsignacion {
    const nombre = raw.colegioAsignatura.nombre ?? raw.colegioAsignatura.asignaturaMaestra.nombre;
    return DocenteAsignacion.reconstitute({
      id:                  raw.id,
      docenteId:           raw.docenteId,
      seccionId:           raw.seccionId,
      colegioAsignaturaId: raw.colegioAsignaturaId,
      asignaturaNombre:    nombre,
      añoAcademico:        raw.añoAcademico,
      esTutor:             raw.esTutor,
      createdAt:           raw.createdAt,
    });
  }
}
