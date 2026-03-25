import {
  Comunicado,
  EstadoComunicado,
  AudienciaComunicado,
} from '../../domain/entities/comunicado.entity';
import { ComunicadoLectura } from '../../domain/entities/comunicado-lectura.entity';

type ComunicadoPrisma = {
  id: string; colegioId: string; titulo: string; contenido: string;
  autorId: string; estado: string; audiencia: string;
  colegioNivelId: string | null; colegioGradoId: string | null;
  seccionId: string | null; destinatarioId: string | null;
  añoAcademico: number; publicadoEn: Date | null;
  createdAt: Date; updatedAt: Date;
};

type ComunicadoLecturaPrisma = {
  id: string; comunicadoId: string; apoderadoId: string; leidoEn: Date;
};

export class ComunicadoMapper {
  static toDomain(raw: ComunicadoPrisma): Comunicado {
    return Comunicado.reconstitute({
      id:             raw.id,
      colegioId:      raw.colegioId,
      titulo:         raw.titulo,
      contenido:      raw.contenido,
      autorId:        raw.autorId,
      estado:         raw.estado         as EstadoComunicado,
      audiencia:      raw.audiencia      as AudienciaComunicado,
      colegioNivelId: raw.colegioNivelId,
      colegioGradoId: raw.colegioGradoId,
      seccionId:      raw.seccionId,
      destinatarioId: raw.destinatarioId,
      añoAcademico:   raw.añoAcademico,
      publicadoEn:    raw.publicadoEn,
      createdAt:      raw.createdAt,
      updatedAt:      raw.updatedAt,
    });
  }

  static lecturaToDomain(raw: ComunicadoLecturaPrisma): ComunicadoLectura {
    return ComunicadoLectura.reconstitute({
      id:           raw.id,
      comunicadoId: raw.comunicadoId,
      apoderadoId:  raw.apoderadoId,
      leidoEn:      raw.leidoEn,
    });
  }
}
