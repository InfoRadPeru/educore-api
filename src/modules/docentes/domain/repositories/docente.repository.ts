import { Docente, DocenteAsignacion, EstadoDocente } from '../entities/docente.entity';

export const DOCENTE_REPOSITORY = 'DocenteRepository';

export interface CrearDocenteConPersonaProps {
  dni:          string;
  nombres:      string;
  apellidos:    string;
  telefono?:    string;
  fechaNac:     Date;
  genero:       'MASCULINO' | 'FEMENINO' | 'OTRO';
  colegioId:    string;
  sedeId?:      string;
  especialidad?: string;
}

export interface ActualizarDocenteProps {
  sedeId?:       string | null;
  especialidad?: string | null;
}

export interface AsignarSeccionProps {
  docenteId:           string;
  seccionId:           string;
  colegioAsignaturaId: string;
  añoAcademico:        number;
  esTutor:             boolean;
}

export interface DocenteRepository {
  crearConPersona(props: CrearDocenteConPersonaProps):    Promise<Docente>;
  // Crea o reutiliza el rol sistema DOCENTE del colegio y genera la UsuarioAsignacion
  crearAsignacionUsuario(usuarioId: string, colegioId: string): Promise<void>;
  buscarPorId(id: string):                               Promise<Docente | null>;
  buscarPorDni(dni: string, colegioId: string):          Promise<Docente | null>;
  listarPorColegio(colegioId: string, estado?: EstadoDocente): Promise<Docente[]>;
  actualizar(id: string, props: ActualizarDocenteProps): Promise<Docente>;
  cambiarEstado(id: string, estado: EstadoDocente):      Promise<Docente>;

  asignarSeccion(props: AsignarSeccionProps):            Promise<DocenteAsignacion>;
  removerAsignacion(id: string):                         Promise<void>;
  buscarAsignacion(id: string):                          Promise<DocenteAsignacion | null>;
  listarAsignaciones(docenteId: string, año?: number):   Promise<DocenteAsignacion[]>;
  existeAsignacion(docenteId: string, seccionId: string, colegioAsignaturaId: string, año: number): Promise<boolean>;
  esTutorEnColegio(docenteId: string, colegioId: string, año: number): Promise<boolean>;
  existeTutorEnSeccion(seccionId: string, año: number):  Promise<boolean>;
}
