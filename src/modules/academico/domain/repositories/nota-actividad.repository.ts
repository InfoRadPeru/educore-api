import { NotaActividad } from '../entities/nota-actividad.entity';
import { Actividad } from '../entities/actividad.entity';

export const NOTA_ACTIVIDAD_REPOSITORY = 'NotaActividadRepository';

export interface RegistrarNotaProps {
  actividadId:     string;
  alumnoId:        string;
  puntaje:         number | null;
  observacion?:    string;
  calificadoPorId: string;
  motivo?:         string;
}

export interface RegistrarNotaBulkItem {
  alumnoId:     string;
  puntaje:      number | null;
  observacion?: string;
}

export interface NotaConActividad {
  nota:        NotaActividad;
  actividad:   Actividad;
  categoriaId: string;
}

export interface NotaActividadRepository {
  upsert(props: RegistrarNotaProps):                                                              Promise<NotaActividad>;
  upsertBulk(actividadId: string, items: RegistrarNotaBulkItem[], calificadoPorId: string):      Promise<NotaActividad[]>;
  buscarPorActividadYAlumno(actividadId: string, alumnoId: string):                              Promise<NotaActividad | null>;
  listarPorActividad(actividadId: string):                                                        Promise<NotaActividad[]>;
  listarPorAlumnoYAsignacion(alumnoId: string, docenteAsignacionId: string):                     Promise<NotaActividad[]>;
  listarPorAlumnoYPeriodo(alumnoId: string, docenteAsignacionId: string, periodoId: string):     Promise<NotaConActividad[]>;
}
