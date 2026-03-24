export type EstadoPrematricula = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';

export interface PrematriculaProps {
  id:             string;
  colegioId:      string;
  alumnoId:       string;
  colegioNivelId: string;
  seccionId:      string | null;
  añoAcademico:   number;
  estado:         EstadoPrematricula;
  observaciones:  string | null;
  matriculaId:    string | null;
  createdAt:      Date;
  updatedAt:      Date;
}

export class Prematricula {
  private constructor(private props: PrematriculaProps) {}

  static reconstitute(props: PrematriculaProps): Prematricula {
    return new Prematricula(props);
  }

  get id():             string             { return this.props.id; }
  get colegioId():      string             { return this.props.colegioId; }
  get alumnoId():       string             { return this.props.alumnoId; }
  get colegioNivelId(): string             { return this.props.colegioNivelId; }
  get seccionId():      string | null      { return this.props.seccionId; }
  get añoAcademico():   number             { return this.props.añoAcademico; }
  get estado():         EstadoPrematricula { return this.props.estado; }
  get observaciones():  string | null      { return this.props.observaciones; }
  get matriculaId():    string | null      { return this.props.matriculaId; }
  get createdAt():      Date               { return this.props.createdAt; }
  get updatedAt():      Date               { return this.props.updatedAt; }

  esPendiente(): boolean { return this.props.estado === 'PENDIENTE'; }

  confirmar(matriculaId: string): void {
    this.props.estado      = 'CONFIRMADA';
    this.props.matriculaId = matriculaId;
  }

  cancelar(observaciones?: string): void {
    this.props.estado        = 'CANCELADA';
    this.props.observaciones = observaciones ?? this.props.observaciones;
  }
}
