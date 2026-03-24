import { Prematricula, EstadoPrematricula } from '../entities/prematricula.entity';

export const PREMATRICULA_REPOSITORY = 'PrematriculaRepository';

export interface CrearPrematriculaProps {
  colegioId:      string;
  alumnoId:       string;
  colegioNivelId: string;
  seccionId?:     string;
  añoAcademico:   number;
  observaciones?: string;
}

export interface ActualizarPrematriculaProps {
  estado?:        EstadoPrematricula;
  seccionId?:     string | null;
  observaciones?: string | null;
  matriculaId?:   string | null;
}

export interface PrematriculaRepository {
  crear(props: CrearPrematriculaProps): Promise<Prematricula>;
  buscarPorId(id: string): Promise<Prematricula | null>;
  listarPorColegio(colegioId: string, estado?: EstadoPrematricula): Promise<Prematricula[]>;
  listarPorAlumno(alumnoId: string): Promise<Prematricula[]>;
  actualizar(id: string, props: ActualizarPrematriculaProps): Promise<Prematricula>;
}
