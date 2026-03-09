// Qué es: Entidad de dominio Sede.
// Patrón: Rich Domain Model.
// Principio SOLID: Single Responsibility — solo conoce las reglas de una Sede.

export interface SedeProps {
  id:        string;
  colegioId: string;
  nombre:    string;
  direccion: string;
  telefono:  string | null;
  email:     string | null;
  activo:    boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Sede {
  private constructor(private readonly props: SedeProps) {}

  static reconstitute(props: SedeProps): Sede {
    return new Sede(props);
  }

  get id():        string      { return this.props.id; }
  get colegioId(): string      { return this.props.colegioId; }
  get nombre():    string      { return this.props.nombre; }
  get direccion(): string      { return this.props.direccion; }
  get telefono():  string|null { return this.props.telefono; }
  get email():     string|null { return this.props.email; }
  get activo():    boolean     { return this.props.activo; }
  get createdAt(): Date        { return this.props.createdAt; }
  get updatedAt(): Date        { return this.props.updatedAt; }

  estaActiva(): boolean { return this.props.activo; }
}