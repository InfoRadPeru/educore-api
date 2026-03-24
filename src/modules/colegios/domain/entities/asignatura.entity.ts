export interface AsignaturaMaestraProps {
  id:          string;
  nombre:      string;
  descripcion: string | null;
  activo:      boolean;
}

export class AsignaturaMaestra {
  private constructor(private readonly props: AsignaturaMaestraProps) {}

  static reconstitute(props: AsignaturaMaestraProps): AsignaturaMaestra {
    return new AsignaturaMaestra(props);
  }

  get id():          string      { return this.props.id; }
  get nombre():      string      { return this.props.nombre; }
  get descripcion(): string|null { return this.props.descripcion; }
  get activo():      boolean     { return this.props.activo; }
}

export interface ColegioAsignaturaProps {
  id:                  string;
  colegioId:           string;
  asignaturaMaestraId: string;
  nombreMaestro:       string;
  nombreOverride:      string | null;
  activo:              boolean;
}

export class ColegioAsignatura {
  private constructor(private readonly props: ColegioAsignaturaProps) {}

  static reconstitute(props: ColegioAsignaturaProps): ColegioAsignatura {
    return new ColegioAsignatura(props);
  }

  get id():                  string      { return this.props.id; }
  get colegioId():           string      { return this.props.colegioId; }
  get asignaturaMaestraId(): string      { return this.props.asignaturaMaestraId; }
  get nombreOverride():      string|null { return this.props.nombreOverride; }
  get activo():              boolean     { return this.props.activo; }

  get nombre(): string {
    return this.props.nombreOverride ?? this.props.nombreMaestro;
  }
}
