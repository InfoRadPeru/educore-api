import { Alumno } from '../../domain/entities/alumno.entity';

type AlumnoPrisma = {
  id:              string;
  colegioId:       string;
  codigoMatricula: string;
  estado:          string;
  colegioOrigenRef: string | null;
  createdAt:       Date;
  updatedAt:       Date;
  persona: {
    id:        string;
    dni:       string;
    nombres:   string;
    apellidos: string;
    fechaNac:  Date;
    genero:    string;
    telefono:  string | null;
    direccion: string | null;
  };
};

export class AlumnoMapper {
  static toDomain(raw: AlumnoPrisma): Alumno {
    return Alumno.reconstitute({
      id:              raw.id,
      personaId:       raw.persona.id,
      colegioId:       raw.colegioId,
      dni:             raw.persona.dni,
      nombres:         raw.persona.nombres,
      apellidos:       raw.persona.apellidos,
      fechaNac:        raw.persona.fechaNac,
      genero:          raw.persona.genero as any,
      telefono:        raw.persona.telefono,
      direccion:       raw.persona.direccion,
      codigoMatricula: raw.codigoMatricula,
      estado:          raw.estado as any,
      colegioOrigenRef: raw.colegioOrigenRef,
      createdAt:       raw.createdAt,
      updatedAt:       raw.updatedAt,
    });
  }
}
