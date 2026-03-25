import { AsignaturaMaestra, ColegioAsignatura } from '../entities/asignatura.entity';

export const ASIGNATURA_MAESTRA_REPOSITORY  = 'AsignaturaMaestraRepository';
export const COLEGIO_ASIGNATURA_REPOSITORY  = 'ColegioAsignaturaRepository';

export interface AsignaturaMaestraRepository {
  listar(soloActivas?: boolean):               Promise<AsignaturaMaestra[]>;
  buscarPorId(id: string):                     Promise<AsignaturaMaestra | null>;
}

export interface ColegioAsignaturaRepository {
  listarPorColegio(colegioId: string, soloActivas?: boolean): Promise<ColegioAsignatura[]>;
  buscarPorId(id: string):                                    Promise<ColegioAsignatura | null>;
  activar(colegioId: string, asignaturaMaestraId: string):    Promise<ColegioAsignatura>;
  cambiarEstado(id: string, activo: boolean):                 Promise<ColegioAsignatura>;
  existeEnColegio(colegioId: string, asignaturaMaestraId: string): Promise<boolean>;
}
