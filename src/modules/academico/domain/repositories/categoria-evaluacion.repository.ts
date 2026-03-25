import { CategoriaEvaluacion } from '../entities/categoria-evaluacion.entity';

export const CATEGORIA_EVALUACION_REPOSITORY = 'CategoriaEvaluacionRepository';

export interface CrearCategoriaProps {
  docenteAsignacionId: string;
  nombre:              string;
  peso:                number;
  orden:               number;
}

export interface ActualizarCategoriaProps {
  nombre?: string;
  peso?:   number;
  orden?:  number;
}

export interface CategoriaEvaluacionRepository {
  crear(props: CrearCategoriaProps):                                                Promise<CategoriaEvaluacion>;
  buscarPorId(id: string):                                                          Promise<CategoriaEvaluacion | null>;
  listarPorAsignacion(docenteAsignacionId: string, soloActivas?: boolean):         Promise<CategoriaEvaluacion[]>;
  buscarPorNombreEnAsignacion(docenteAsignacionId: string, nombre: string):        Promise<CategoriaEvaluacion | null>;
  sumaPesosPorAsignacion(docenteAsignacionId: string, excluirId?: string):         Promise<number>;
  tieneActividades(id: string):                                                     Promise<boolean>;
  actualizar(id: string, props: ActualizarCategoriaProps):                         Promise<CategoriaEvaluacion>;
  desactivar(id: string):                                                           Promise<void>;
}
