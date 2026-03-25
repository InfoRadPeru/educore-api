import { Postulacion, EstadoPostulacion } from '../entities/postulacion.entity';
import type { Genero } from '@modules/alumnos/domain/entities/alumno.entity';

export const POSTULACION_REPOSITORY = 'PostulacionRepository';

export interface CrearPostulacionProps {
  colegioId:      string;
  sedeId?:        string;
  nombres:        string;
  apellidos:      string;
  dni:            string;
  fechaNac:       Date;
  genero:         Genero;
  colegioNivelId: string;
  añoAcademico:   number;
  observaciones?: string;
}

export interface ActualizarPostulacionProps {
  estado?:         EstadoPostulacion;
  observaciones?:  string | null;
  perfilAlumnoId?: string | null;
}

export interface PostulacionRepository {
  crear(props: CrearPostulacionProps): Promise<Postulacion>;
  buscarPorId(id: string): Promise<Postulacion | null>;
  listarPorColegio(colegioId: string, estado?: EstadoPostulacion): Promise<Postulacion[]>;
  actualizar(id: string, props: ActualizarPostulacionProps): Promise<Postulacion>;
}
