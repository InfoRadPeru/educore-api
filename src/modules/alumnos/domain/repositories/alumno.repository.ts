import { Alumno, EstadoAlumno, Genero } from '../entities/alumno.entity';

export const ALUMNO_REPOSITORY = 'AlumnoRepository';

export interface CrearAlumnoProps {
  colegioId:        string;
  dni:              string;
  nombres:          string;
  apellidos:        string;
  fechaNac:         Date;
  genero:           Genero;
  telefono?:        string;
  direccion?:       string;
  codigoMatricula:  string;
  colegioOrigenRef?: string;
}

export interface ActualizarAlumnoProps {
  nombres?:         string;
  apellidos?:       string;
  fechaNac?:        Date;
  genero?:          Genero;
  telefono?:        string | null;
  direccion?:       string | null;
  colegioOrigenRef?: string | null;
}

export interface AlumnoRepository {
  crear(props: CrearAlumnoProps): Promise<Alumno>;
  buscarPorId(id: string): Promise<Alumno | null>;
  buscarPorDni(dni: string, colegioId: string): Promise<Alumno | null>;
  listarPorColegio(colegioId: string, estado?: EstadoAlumno): Promise<Alumno[]>;
  actualizar(id: string, props: ActualizarAlumnoProps): Promise<Alumno>;
  cambiarEstado(id: string, estado: EstadoAlumno): Promise<Alumno>;
}
