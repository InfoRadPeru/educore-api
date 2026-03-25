export type EstadoMatricula =
  | 'NUEVA_MATRICULA'
  | 'MATRICULADO'
  | 'REPITENTE'
  | 'PROMOVIDO'
  | 'EXPULSADO'
  | 'CAMBIO_DE_COLEGIO';

export interface MatriculaProps {
  id:             string;
  perfilAlumnoId: string;
  seccionId:      string;
  añoAcademico:   number;
  estado:         EstadoMatricula;
  observaciones:  string | null;
  createdAt:      Date;
  updatedAt:      Date;
}

export class Matricula {
  private constructor(private props: MatriculaProps) {}

  static reconstitute(props: MatriculaProps): Matricula {
    return new Matricula(props);
  }

  get id():             string          { return this.props.id; }
  get perfilAlumnoId(): string          { return this.props.perfilAlumnoId; }
  get seccionId():      string          { return this.props.seccionId; }
  get añoAcademico():   number          { return this.props.añoAcademico; }
  get estado():         EstadoMatricula { return this.props.estado; }
  get observaciones():  string | null   { return this.props.observaciones; }
  get createdAt():      Date            { return this.props.createdAt; }
  get updatedAt():      Date            { return this.props.updatedAt; }

  estaActiva(): boolean {
    return this.props.estado !== 'EXPULSADO' && this.props.estado !== 'CAMBIO_DE_COLEGIO';
  }

  cambiarEstado(nuevoEstado: EstadoMatricula, observaciones?: string): void {
    this.props.estado        = nuevoEstado;
    this.props.observaciones = observaciones ?? this.props.observaciones;
  }
}
