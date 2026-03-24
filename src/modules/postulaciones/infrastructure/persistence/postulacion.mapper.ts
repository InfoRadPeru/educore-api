import { Postulacion } from '../../domain/entities/postulacion.entity';

type PostulacionPrisma = {
  id: string; colegioId: string; sedeId: string | null;
  nombres: string; apellidos: string; dni: string;
  fechaNac: Date; genero: string; colegioNivelId: string;
  añoAcademico: number; estado: string; observaciones: string | null;
  perfilAlumnoId: string | null; createdAt: Date; updatedAt: Date;
};

export class PostulacionMapper {
  static toDomain(raw: PostulacionPrisma): Postulacion {
    return Postulacion.reconstitute({
      id: raw.id, colegioId: raw.colegioId, sedeId: raw.sedeId,
      nombres: raw.nombres, apellidos: raw.apellidos, dni: raw.dni,
      fechaNac: raw.fechaNac, genero: raw.genero as any,
      colegioNivelId: raw.colegioNivelId, añoAcademico: raw.añoAcademico,
      estado: raw.estado as any, observaciones: raw.observaciones,
      perfilAlumnoId: raw.perfilAlumnoId, createdAt: raw.createdAt, updatedAt: raw.updatedAt,
    });
  }
}
