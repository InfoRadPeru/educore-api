export type TipoNotificacion = 'COMUNICADO' | 'BOLETIN' | 'PAGO' | 'SISTEMA';

export interface NotificacionProps {
  id:          string;
  usuarioId:   string;
  tipo:        TipoNotificacion;
  titulo:      string;
  mensaje:     string;
  entidadTipo: string | null;
  entidadId:   string | null;
  leida:       boolean;
  createdAt:   Date;
}

export class Notificacion {
  private constructor(private readonly props: NotificacionProps) {}

  static reconstitute(props: NotificacionProps): Notificacion {
    return new Notificacion(props);
  }

  get id():          string             { return this.props.id; }
  get usuarioId():   string             { return this.props.usuarioId; }
  get tipo():        TipoNotificacion   { return this.props.tipo; }
  get titulo():      string             { return this.props.titulo; }
  get mensaje():     string             { return this.props.mensaje; }
  get entidadTipo(): string | null      { return this.props.entidadTipo; }
  get entidadId():   string | null      { return this.props.entidadId; }
  get leida():       boolean            { return this.props.leida; }
  get createdAt():   Date               { return this.props.createdAt; }
}
