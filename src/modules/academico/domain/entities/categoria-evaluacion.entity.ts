export interface CategoriaEvaluacionProps {
  id:                  string;
  docenteAsignacionId: string;
  nombre:              string;
  peso:                number;
  orden:               number;
  activo:              boolean;
  createdAt:           Date;
  updatedAt:           Date;
}

export class CategoriaEvaluacion {
  private constructor(private readonly props: CategoriaEvaluacionProps) {}

  static reconstitute(props: CategoriaEvaluacionProps): CategoriaEvaluacion {
    return new CategoriaEvaluacion(props);
  }

  get id():                  string  { return this.props.id; }
  get docenteAsignacionId(): string  { return this.props.docenteAsignacionId; }
  get nombre():              string  { return this.props.nombre; }
  get peso():                number  { return this.props.peso; }
  get orden():               number  { return this.props.orden; }
  get activo():              boolean { return this.props.activo; }
  get createdAt():           Date    { return this.props.createdAt; }
  get updatedAt():           Date    { return this.props.updatedAt; }
}
