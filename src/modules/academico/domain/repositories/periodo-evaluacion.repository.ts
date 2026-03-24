import { PeriodoEvaluacion } from '../entities/periodo-evaluacion.entity';

export const PERIODO_EVALUACION_REPOSITORY = 'PeriodoEvaluacionRepository';

export interface CrearPeriodoProps {
  colegioId:    string;
  añoAcademico: number;
  nombre:       string;
  numero:       number;
  fechaInicio:  Date;
  fechaFin:     Date;
}

export interface ActualizarPeriodoProps {
  nombre?:      string;
  fechaInicio?: Date;
  fechaFin?:    Date;
}

export interface PeriodoEvaluacionRepository {
  crear(props: CrearPeriodoProps):                                                    Promise<PeriodoEvaluacion>;
  buscarPorId(id: string):                                                            Promise<PeriodoEvaluacion | null>;
  listarPorColegio(colegioId: string, año?: number):                                 Promise<PeriodoEvaluacion[]>;
  buscarPorNumeroYAño(colegioId: string, año: number, numero: number):               Promise<PeriodoEvaluacion | null>;
  actualizar(id: string, props: ActualizarPeriodoProps):                             Promise<PeriodoEvaluacion>;
  cambiarEstado(id: string, activo: boolean):                                        Promise<PeriodoEvaluacion>;
}
