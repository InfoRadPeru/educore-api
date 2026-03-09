// Qué es: Entidad de dominio que representa un nivel activado por el colegio.
// Combina datos del NivelMaestro con el estado de activación del ColegioNivel.
// Principio SOLID: Single Responsibility — solo conoce las reglas de un Nivel.

export interface NivelProps {
  id:             string; // id del ColegioNivel
  nivelMaestroId: string;
  nombre:         string; // viene del NivelMaestro
  orden:          number;
  activo:         boolean;
  turnos:         string[];
}

export class Nivel {
  private constructor(private readonly props: NivelProps) {}

  static reconstitute(props: NivelProps): Nivel {
    return new Nivel(props);
  }

  get id():             string   { return this.props.id; }
  get nivelMaestroId(): string   { return this.props.nivelMaestroId; }
  get nombre():         string   { return this.props.nombre; }
  get orden():          number   { return this.props.orden; }
  get activo():         boolean  { return this.props.activo; }
  get turnos():         string[] { return this.props.turnos; }

  estaActivo(): boolean { return this.props.activo; }
}