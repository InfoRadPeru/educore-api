export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO';

export interface AsistenciaProps {
  id:                  string;
  docenteAsignacionId: string;
  alumnoId:            string;
  fecha:               Date;
  estado:              EstadoAsistencia;
  observacion:         string | null;
  registradoPorId:     string;
  createdAt:           Date;
  updatedAt:           Date;
}

export class Asistencia {
  private constructor(private readonly props: AsistenciaProps) {}

  static reconstitute(props: AsistenciaProps): Asistencia {
    return new Asistencia(props);
  }

  get id():                  string           { return this.props.id; }
  get docenteAsignacionId(): string           { return this.props.docenteAsignacionId; }
  get alumnoId():            string           { return this.props.alumnoId; }
  get fecha():               Date             { return this.props.fecha; }
  get estado():              EstadoAsistencia { return this.props.estado; }
  get observacion():         string|null      { return this.props.observacion; }
  get registradoPorId():     string           { return this.props.registradoPorId; }
  get createdAt():           Date             { return this.props.createdAt; }
  get updatedAt():           Date             { return this.props.updatedAt; }
}
