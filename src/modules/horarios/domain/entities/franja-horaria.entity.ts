export interface FranjaHorariaProps {
  id:         string;
  colegioId:  string;
  nombre:     string;
  horaInicio: string;
  horaFin:    string;
  orden:      number;
  activo:     boolean;
  createdAt:  Date;
  updatedAt:  Date;
}

export class FranjaHoraria {
  private constructor(private readonly props: FranjaHorariaProps) {}

  static reconstitute(props: FranjaHorariaProps): FranjaHoraria {
    return new FranjaHoraria(props);
  }

  get id():         string  { return this.props.id; }
  get colegioId():  string  { return this.props.colegioId; }
  get nombre():     string  { return this.props.nombre; }
  get horaInicio(): string  { return this.props.horaInicio; }
  get horaFin():    string  { return this.props.horaFin; }
  get orden():      number  { return this.props.orden; }
  get activo():     boolean { return this.props.activo; }
  get createdAt():  Date    { return this.props.createdAt; }
  get updatedAt():  Date    { return this.props.updatedAt; }
}
