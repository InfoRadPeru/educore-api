import { GradoAsignatura } from '../entities/grado-asignatura.entity';

export const GRADO_ASIGNATURA_REPOSITORY = 'GradoAsignaturaRepository';

export interface GradoAsignaturaRepository {
  listarPorGrado(colegioGradoId: string):                                            Promise<GradoAsignatura[]>;
  buscarPorId(id: string):                                                           Promise<GradoAsignatura | null>;
  asignar(colegioGradoId: string, colegioAsignaturaId: string, horasSemanales?: number): Promise<GradoAsignatura>;
  actualizar(id: string, horasSemanales: number | null):                             Promise<GradoAsignatura>;
  remover(id: string):                                                               Promise<void>;
  existeEnGrado(colegioGradoId: string, colegioAsignaturaId: string):               Promise<boolean>;
}
