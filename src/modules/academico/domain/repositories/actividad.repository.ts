import { Actividad } from '../entities/actividad.entity';

export const ACTIVIDAD_REPOSITORY = 'ActividadRepository';

export interface CrearActividadProps {
  docenteAsignacionId: string;
  periodoId:           string;
  categoriaId:         string;
  titulo:              string;
  descripcion?:        string;
  fechaLimite?:        Date;
  puntajeMaximo:       number;
  pesoEnCategoria:     number;
}

export interface ActualizarActividadProps {
  titulo?:          string;
  descripcion?:     string | null;
  fechaLimite?:     Date | null;
  puntajeMaximo?:   number;
  pesoEnCategoria?: number;
}

export interface ActividadRepository {
  crear(props: CrearActividadProps):                                                    Promise<Actividad>;
  buscarPorId(id: string):                                                              Promise<Actividad | null>;
  listarPorAsignacionYPeriodo(docenteAsignacionId: string, periodoId: string):         Promise<Actividad[]>;
  listarPorAsignacion(docenteAsignacionId: string):                                    Promise<Actividad[]>;
  tieneNotas(id: string):                                                               Promise<boolean>;
  actualizar(id: string, props: ActualizarActividadProps):                             Promise<Actividad>;
  desactivar(id: string):                                                               Promise<void>;
}
