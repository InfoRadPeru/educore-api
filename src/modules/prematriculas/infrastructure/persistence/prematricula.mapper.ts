import { Prematricula } from '../../domain/entities/prematricula.entity';

type PrematriculaPrisma = {
  id: string; colegioId: string; alumnoId: string;
  colegioNivelId: string; seccionId: string | null;
  añoAcademico: number; estado: string; observaciones: string | null;
  matriculaId: string | null; createdAt: Date; updatedAt: Date;
};

export class PrematriculaMapper {
  static toDomain(raw: PrematriculaPrisma): Prematricula {
    return Prematricula.reconstitute({
      id: raw.id, colegioId: raw.colegioId, alumnoId: raw.alumnoId,
      colegioNivelId: raw.colegioNivelId, seccionId: raw.seccionId,
      añoAcademico: raw.añoAcademico, estado: raw.estado as any,
      observaciones: raw.observaciones, matriculaId: raw.matriculaId,
      createdAt: raw.createdAt, updatedAt: raw.updatedAt,
    });
  }
}
