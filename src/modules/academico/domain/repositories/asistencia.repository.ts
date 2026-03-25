import { Asistencia, type EstadoAsistencia } from '../entities/asistencia.entity';

export const ASISTENCIA_REPOSITORY = 'AsistenciaRepository';

export interface RegistrarAsistenciaProps {
  docenteAsignacionId: string;
  alumnoId:            string;
  fecha:               Date;
  estado:              EstadoAsistencia;
  observacion?:        string;
  registradoPorId:     string;
}

export interface AsistenciaRepository {
  upsert(props: RegistrarAsistenciaProps):                                                               Promise<Asistencia>;
  upsertBulk(docenteAsignacionId: string, fecha: Date, registros: Omit<RegistrarAsistenciaProps, 'docenteAsignacionId' | 'fecha'>[]): Promise<Asistencia[]>;
  buscarPorAsignacionAlumnoFecha(docenteAsignacionId: string, alumnoId: string, fecha: Date):           Promise<Asistencia | null>;
  listarPorAsignacionYFecha(docenteAsignacionId: string, fecha: Date):                                  Promise<Asistencia[]>;
  listarPorAlumnoYAsignacion(alumnoId: string, docenteAsignacionId: string):                            Promise<Asistencia[]>;
}
