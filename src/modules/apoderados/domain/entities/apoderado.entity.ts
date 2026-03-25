export type TipoParentesco = 'PADRE' | 'MADRE' | 'TUTOR';

export interface ApoderadoProps {
  id:         string;
  personaId:  string;
  dni:        string;
  nombres:    string;
  apellidos:  string;
  telefono:   string | null;
  usuarioId:  string | null;
  createdAt:  Date;
  updatedAt:  Date;
}

export interface VinculoAlumno {
  alumnoId:   string;
  parentesco: TipoParentesco;
}

export class Apoderado {
  private constructor(private readonly props: ApoderadoProps) {}

  static reconstitute(props: ApoderadoProps): Apoderado {
    return new Apoderado(props);
  }

  get id():        string      { return this.props.id; }
  get personaId(): string      { return this.props.personaId; }
  get dni():       string      { return this.props.dni; }
  get nombres():   string      { return this.props.nombres; }
  get apellidos(): string      { return this.props.apellidos; }
  get telefono():  string | null { return this.props.telefono; }
  get usuarioId(): string | null { return this.props.usuarioId; }
  get createdAt(): Date        { return this.props.createdAt; }
  get updatedAt(): Date        { return this.props.updatedAt; }

  get nombreCompleto(): string {
    return `${this.props.nombres} ${this.props.apellidos}`;
  }

  tieneAccesoPortal(): boolean {
    return this.props.usuarioId !== null;
  }
}
