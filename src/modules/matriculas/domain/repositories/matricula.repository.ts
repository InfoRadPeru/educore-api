import { Matricula, EstadoMatricula } from '../entities/matricula.entity';

export const MATRICULA_REPOSITORY = 'MatriculaRepository';

export interface CrearMatriculaProps {
  perfilAlumnoId: string;
  seccionId:      string;
  añoAcademico:   number;
  estado?:        EstadoMatricula;
  observaciones?: string;
}

export interface MatriculaRepository {
  crear(props: CrearMatriculaProps): Promise<Matricula>;
  buscarPorId(id: string): Promise<Matricula | null>;
  listarPorAlumno(perfilAlumnoId: string): Promise<Matricula[]>;
  listarPorSeccion(seccionId: string, añoAcademico: number): Promise<Matricula[]>;
  cambiarEstado(id: string, estado: EstadoMatricula, observaciones?: string): Promise<Matricula>;
  existeMatriculaActiva(perfilAlumnoId: string, añoAcademico: number): Promise<boolean>;
}
