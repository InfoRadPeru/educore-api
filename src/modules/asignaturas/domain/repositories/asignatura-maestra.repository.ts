import { AsignaturaMaestra } from '../entities/asignatura.entity';

export const ASIGNATURA_MAESTRA_REPOSITORY = 'AsignaturaMaestraRepository';

export interface CrearAsignaturaMaestraProps {
  nombre:      string;
  descripcion?: string;
}

export interface ActualizarAsignaturaMaestraProps {
  nombre?:      string;
  descripcion?: string | null;
}

export interface AsignaturaMaestraRepository {
  listar(soloActivas?: boolean):                                       Promise<AsignaturaMaestra[]>;
  buscarPorId(id: string):                                             Promise<AsignaturaMaestra | null>;
  buscarPorNombre(nombre: string):                                     Promise<AsignaturaMaestra | null>;
  crear(props: CrearAsignaturaMaestraProps):                           Promise<AsignaturaMaestra>;
  actualizar(id: string, props: ActualizarAsignaturaMaestraProps):     Promise<AsignaturaMaestra>;
  cambiarEstado(id: string, activo: boolean):                          Promise<AsignaturaMaestra>;
}
