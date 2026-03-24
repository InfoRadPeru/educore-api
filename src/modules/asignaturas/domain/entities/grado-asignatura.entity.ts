export interface GradoAsignaturaProps {
  id:                  string;
  colegioGradoId:      string;
  colegioAsignaturaId: string;
  asignaturaNombre:    string;
  horasSemanales:      number | null;
  createdAt:           Date;
  updatedAt:           Date;
}

export class GradoAsignatura {
  private constructor(private readonly props: GradoAsignaturaProps) {}

  static reconstitute(props: GradoAsignaturaProps): GradoAsignatura {
    return new GradoAsignatura(props);
  }

  get id():                  string      { return this.props.id; }
  get colegioGradoId():      string      { return this.props.colegioGradoId; }
  get colegioAsignaturaId(): string      { return this.props.colegioAsignaturaId; }
  get asignaturaNombre():    string      { return this.props.asignaturaNombre; }
  get horasSemanales():      number|null { return this.props.horasSemanales; }
  get createdAt():           Date        { return this.props.createdAt; }
  get updatedAt():           Date        { return this.props.updatedAt; }
}
