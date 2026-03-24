import { ColegioAsignatura } from '../entities/asignatura.entity';

export const COLEGIO_ASIGNATURA_REPOSITORY = 'ColegioAsignaturaRepository';

export interface ColegioAsignaturaRepository {
  listarPorColegio(colegioId: string, soloActivas?: boolean): Promise<ColegioAsignatura[]>;
  buscarPorId(id: string):                                    Promise<ColegioAsignatura | null>;
  activar(colegioId: string, asignaturaMaestraId: string):    Promise<ColegioAsignatura>;
  renombrar(id: string, nombre: string | null):               Promise<ColegioAsignatura>;
  cambiarEstado(id: string, activo: boolean):                 Promise<ColegioAsignatura>;
  existeEnColegio(colegioId: string, asignaturaMaestraId: string): Promise<boolean>;
}
