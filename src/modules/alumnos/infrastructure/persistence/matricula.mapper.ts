import { Matricula } from '../../domain/entities/matricula.entity';

type MatriculaPrisma = {
  id:             string;
  perfilAlumnoId: string;
  seccionId:      string;
  añoAcademico:   number;
  estado:         string;
  observaciones:  string | null;
  createdAt:      Date;
  updatedAt:      Date;
};

export class MatriculaMapper {
  static toDomain(raw: MatriculaPrisma): Matricula {
    return Matricula.reconstitute({
      id:             raw.id,
      perfilAlumnoId: raw.perfilAlumnoId,
      seccionId:      raw.seccionId,
      añoAcademico:   raw.añoAcademico,
      estado:         raw.estado as any,
      observaciones:  raw.observaciones,
      createdAt:      raw.createdAt,
      updatedAt:      raw.updatedAt,
    });
  }
}
