import { Apoderado } from '../../domain/entities/apoderado.entity';

type ApoderadoPrisma = {
  id:        string;
  personaId: string;
  createdAt: Date;
  updatedAt: Date;
  persona: {
    dni:       string;
    nombres:   string;
    apellidos: string;
    telefono:  string | null;
    usuario:   { id: string } | null;
  };
};

export class ApoderadoMapper {
  static toDomain(raw: ApoderadoPrisma): Apoderado {
    return Apoderado.reconstitute({
      id:        raw.id,
      personaId: raw.personaId,
      dni:       raw.persona.dni,
      nombres:   raw.persona.nombres,
      apellidos: raw.persona.apellidos,
      telefono:  raw.persona.telefono,
      usuarioId: raw.persona.usuario?.id ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
