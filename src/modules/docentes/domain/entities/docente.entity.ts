export type EstadoDocente = 'ACTIVO' | 'INACTIVO' | 'LICENCIA';

export interface DocenteProps {
  id:           string;
  personaId:    string;
  colegioId:    string;
  sedeId:       string | null;
  especialidad: string | null;
  estado:       EstadoDocente;
  dni:          string;
  nombres:      string;
  apellidos:    string;
  telefono:     string | null;
  usuarioId:    string | null;
  createdAt:    Date;
  updatedAt:    Date;
}

export interface DocenteAsignacionProps {
  id:                  string;
  docenteId:           string;
  seccionId:           string;
  colegioAsignaturaId: string;
  asignaturaNombre:    string;
  añoAcademico:        number;
  esTutor:             boolean;
  createdAt:           Date;
}

export class Docente {
  private constructor(private readonly props: DocenteProps) {}

  static reconstitute(props: DocenteProps): Docente {
    return new Docente(props);
  }

  get id():           string        { return this.props.id; }
  get personaId():    string        { return this.props.personaId; }
  get colegioId():    string        { return this.props.colegioId; }
  get sedeId():       string | null { return this.props.sedeId; }
  get especialidad(): string | null { return this.props.especialidad; }
  get estado():       EstadoDocente { return this.props.estado; }
  get dni():          string        { return this.props.dni; }
  get nombres():      string        { return this.props.nombres; }
  get apellidos():    string        { return this.props.apellidos; }
  get telefono():     string | null { return this.props.telefono; }
  get usuarioId():    string | null { return this.props.usuarioId; }
  get createdAt():    Date          { return this.props.createdAt; }
  get updatedAt():    Date          { return this.props.updatedAt; }

  get nombreCompleto(): string {
    return `${this.props.nombres} ${this.props.apellidos}`;
  }

  estaActivo(): boolean {
    return this.props.estado === 'ACTIVO';
  }
}

export class DocenteAsignacion {
  private constructor(private readonly props: DocenteAsignacionProps) {}

  static reconstitute(props: DocenteAsignacionProps): DocenteAsignacion {
    return new DocenteAsignacion(props);
  }

  get id():                  string  { return this.props.id; }
  get docenteId():           string  { return this.props.docenteId; }
  get seccionId():           string  { return this.props.seccionId; }
  get colegioAsignaturaId(): string  { return this.props.colegioAsignaturaId; }
  get asignaturaNombre():    string  { return this.props.asignaturaNombre; }
  get añoAcademico():        number  { return this.props.añoAcademico; }
  get esTutor():             boolean { return this.props.esTutor; }
  get createdAt():           Date    { return this.props.createdAt; }
}
