export interface PeriodoEvaluacionProps {
  id:           string;
  colegioId:    string;
  añoAcademico: number;
  nombre:       string;
  numero:       number;
  fechaInicio:  Date;
  fechaFin:     Date;
  activo:       boolean;
  createdAt:    Date;
  updatedAt:    Date;
}

export class PeriodoEvaluacion {
  private constructor(private readonly props: PeriodoEvaluacionProps) {}

  static reconstitute(props: PeriodoEvaluacionProps): PeriodoEvaluacion {
    return new PeriodoEvaluacion(props);
  }

  get id():           string  { return this.props.id; }
  get colegioId():    string  { return this.props.colegioId; }
  get añoAcademico(): number  { return this.props.añoAcademico; }
  get nombre():       string  { return this.props.nombre; }
  get numero():       number  { return this.props.numero; }
  get fechaInicio():  Date    { return this.props.fechaInicio; }
  get fechaFin():     Date    { return this.props.fechaFin; }
  get activo():       boolean { return this.props.activo; }
  get createdAt():    Date    { return this.props.createdAt; }
  get updatedAt():    Date    { return this.props.updatedAt; }
}
