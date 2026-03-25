export type EstadoAlumno = 'ACTIVO' | 'INACTIVO' | 'RETIRADO';
export type Genero = 'MASCULINO' | 'FEMENINO' | 'OTRO';

export interface AlumnoProps {
  id:               string;   // perfilAlumnoId
  personaId:        string;
  colegioId:        string;
  dni:              string;
  nombres:          string;
  apellidos:        string;
  fechaNac:         Date;
  genero:           Genero;
  telefono:         string | null;
  direccion:        string | null;
  codigoMatricula:  string;
  estado:           EstadoAlumno;
  colegioOrigenRef: string | null;
  createdAt:        Date;
  updatedAt:        Date;
}

export class Alumno {
  private constructor(private readonly props: AlumnoProps) {}

  static reconstitute(props: AlumnoProps): Alumno {
    return new Alumno(props);
  }

  get id():               string       { return this.props.id; }
  get personaId():        string       { return this.props.personaId; }
  get colegioId():        string       { return this.props.colegioId; }
  get dni():              string       { return this.props.dni; }
  get nombres():          string       { return this.props.nombres; }
  get apellidos():        string       { return this.props.apellidos; }
  get fechaNac():         Date         { return this.props.fechaNac; }
  get genero():           Genero       { return this.props.genero; }
  get telefono():         string | null { return this.props.telefono; }
  get direccion():        string | null { return this.props.direccion; }
  get codigoMatricula():  string       { return this.props.codigoMatricula; }
  get estado():           EstadoAlumno { return this.props.estado; }
  get colegioOrigenRef(): string | null { return this.props.colegioOrigenRef; }
  get createdAt():        Date         { return this.props.createdAt; }
  get updatedAt():        Date         { return this.props.updatedAt; }

  estaActivo(): boolean   { return this.props.estado === 'ACTIVO'; }
  estaRetirado(): boolean { return this.props.estado === 'RETIRADO'; }

  nombreCompleto(): string {
    return `${this.props.nombres} ${this.props.apellidos}`;
  }
}
