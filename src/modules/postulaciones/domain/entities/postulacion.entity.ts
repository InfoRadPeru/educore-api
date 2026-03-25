import type { Genero } from '@modules/alumnos/domain/entities/alumno.entity';

export type EstadoPostulacion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'EXPIRADA';

export interface PostulacionProps {
  id:             string;
  colegioId:      string;
  sedeId:         string | null;
  nombres:        string;
  apellidos:      string;
  dni:            string;
  fechaNac:       Date;
  genero:         Genero;
  colegioNivelId: string;
  añoAcademico:   number;
  estado:         EstadoPostulacion;
  observaciones:  string | null;
  perfilAlumnoId: string | null;
  createdAt:      Date;
  updatedAt:      Date;
}

export class Postulacion {
  private constructor(private props: PostulacionProps) {}

  static reconstitute(props: PostulacionProps): Postulacion {
    return new Postulacion(props);
  }

  get id():             string            { return this.props.id; }
  get colegioId():      string            { return this.props.colegioId; }
  get sedeId():         string | null     { return this.props.sedeId; }
  get nombres():        string            { return this.props.nombres; }
  get apellidos():      string            { return this.props.apellidos; }
  get dni():            string            { return this.props.dni; }
  get fechaNac():       Date              { return this.props.fechaNac; }
  get genero():         Genero            { return this.props.genero; }
  get colegioNivelId(): string            { return this.props.colegioNivelId; }
  get añoAcademico():   number            { return this.props.añoAcademico; }
  get estado():         EstadoPostulacion { return this.props.estado; }
  get observaciones():  string | null     { return this.props.observaciones; }
  get perfilAlumnoId(): string | null     { return this.props.perfilAlumnoId; }
  get createdAt():      Date              { return this.props.createdAt; }
  get updatedAt():      Date              { return this.props.updatedAt; }

  esPendiente(): boolean { return this.props.estado === 'PENDIENTE'; }

  aprobar(perfilAlumnoId: string): void {
    this.props.estado         = 'APROBADA';
    this.props.perfilAlumnoId = perfilAlumnoId;
  }

  rechazar(observaciones?: string): void {
    this.props.estado        = 'RECHAZADA';
    this.props.observaciones = observaciones ?? this.props.observaciones;
  }
}
