export interface NotaActividadProps {
  id:              string;
  actividadId:     string;
  alumnoId:        string;
  puntaje:         number | null;
  observacion:     string | null;
  calificadoPorId: string;
  createdAt:       Date;
  updatedAt:       Date;
}

export class NotaActividad {
  private constructor(private readonly props: NotaActividadProps) {}

  static reconstitute(props: NotaActividadProps): NotaActividad {
    return new NotaActividad(props);
  }

  get id():              string      { return this.props.id; }
  get actividadId():     string      { return this.props.actividadId; }
  get alumnoId():        string      { return this.props.alumnoId; }
  get puntaje():         number|null { return this.props.puntaje; }
  get observacion():     string|null { return this.props.observacion; }
  get calificadoPorId(): string      { return this.props.calificadoPorId; }
  get createdAt():       Date        { return this.props.createdAt; }
  get updatedAt():       Date        { return this.props.updatedAt; }

  estaPendiente(): boolean { return this.props.puntaje === null; }
}
