export type EstadoComunicado    = 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';
export type AudienciaComunicado = 'COLEGIO' | 'NIVEL' | 'GRADO' | 'SECCION' | 'INDIVIDUAL';

export interface ComunicadoProps {
  id:             string;
  colegioId:      string;
  titulo:         string;
  contenido:      string;
  autorId:        string;
  estado:         EstadoComunicado;
  audiencia:      AudienciaComunicado;
  colegioNivelId: string | null;
  colegioGradoId: string | null;
  seccionId:      string | null;
  destinatarioId: string | null;
  añoAcademico:   number;
  publicadoEn:    Date | null;
  createdAt:      Date;
  updatedAt:      Date;
}

export class Comunicado {
  private constructor(private readonly props: ComunicadoProps) {}

  static reconstitute(props: ComunicadoProps): Comunicado {
    return new Comunicado(props);
  }

  get id():             string              { return this.props.id; }
  get colegioId():      string              { return this.props.colegioId; }
  get titulo():         string              { return this.props.titulo; }
  get contenido():      string              { return this.props.contenido; }
  get autorId():        string              { return this.props.autorId; }
  get estado():         EstadoComunicado    { return this.props.estado; }
  get audiencia():      AudienciaComunicado { return this.props.audiencia; }
  get colegioNivelId(): string | null       { return this.props.colegioNivelId; }
  get colegioGradoId(): string | null       { return this.props.colegioGradoId; }
  get seccionId():      string | null       { return this.props.seccionId; }
  get destinatarioId(): string | null       { return this.props.destinatarioId; }
  get añoAcademico():   number              { return this.props.añoAcademico; }
  get publicadoEn():    Date | null         { return this.props.publicadoEn; }
  get createdAt():      Date                { return this.props.createdAt; }
  get updatedAt():      Date                { return this.props.updatedAt; }

  esBorrador():    boolean { return this.props.estado === 'BORRADOR'; }
  estaPublicado(): boolean { return this.props.estado === 'PUBLICADO'; }
}
