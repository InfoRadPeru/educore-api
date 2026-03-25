import { NotaPeriodo } from '../entities/nota-periodo.entity';

export const NOTA_PERIODO_REPOSITORY = 'NotaPeriodoRepository';

export interface UpsertNotaPeriodoProps {
  alumnoId:            string;
  docenteAsignacionId: string;
  periodoId:           string;
  notaFinal:           number;
  esManual:            boolean;
  calculadaEn:         Date;
  calculadaPorId:      string;
}

export interface NotaPeriodoRepository {
  upsert(props: UpsertNotaPeriodoProps):                                                                          Promise<NotaPeriodo>;
  buscarPorAlumnoAsignacionPeriodo(alumnoId: string, docenteAsignacionId: string, periodoId: string):            Promise<NotaPeriodo | null>;
  listarPorAlumnoYAsignacion(alumnoId: string, docenteAsignacionId: string):                                     Promise<NotaPeriodo[]>;
}
