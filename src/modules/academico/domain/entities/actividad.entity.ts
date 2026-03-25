export interface ActividadProps {
  id:                  string;
  docenteAsignacionId: string;
  periodoId:           string;
  categoriaId:         string;
  titulo:              string;
  descripcion:         string | null;
  fechaLimite:         Date | null;
  puntajeMaximo:       number;
  pesoEnCategoria:     number;
  activo:              boolean;
  createdAt:           Date;
  updatedAt:           Date;
}

export class Actividad {
  private constructor(private readonly props: ActividadProps) {}

  static reconstitute(props: ActividadProps): Actividad {
    return new Actividad(props);
  }

  get id():                  string      { return this.props.id; }
  get docenteAsignacionId(): string      { return this.props.docenteAsignacionId; }
  get periodoId():           string      { return this.props.periodoId; }
  get categoriaId():         string      { return this.props.categoriaId; }
  get titulo():              string      { return this.props.titulo; }
  get descripcion():         string|null { return this.props.descripcion; }
  get fechaLimite():         Date|null   { return this.props.fechaLimite; }
  get puntajeMaximo():       number      { return this.props.puntajeMaximo; }
  get pesoEnCategoria():     number      { return this.props.pesoEnCategoria; }
  get activo():              boolean     { return this.props.activo; }
  get createdAt():           Date        { return this.props.createdAt; }
  get updatedAt():           Date        { return this.props.updatedAt; }
}
