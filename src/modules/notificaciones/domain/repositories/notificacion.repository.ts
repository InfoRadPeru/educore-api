import { Notificacion, TipoNotificacion } from '../entities/notificacion.entity';

export const NOTIFICACION_REPOSITORY = 'NOTIFICACION_REPOSITORY';

export interface CrearNotificacionProps {
  usuarioId:   string;
  tipo:        TipoNotificacion;
  titulo:      string;
  mensaje:     string;
  entidadTipo?: string;
  entidadId?:  string;
}

export interface AudienciaComunicado {
  colegioId:      string;
  audiencia:      'COLEGIO' | 'NIVEL' | 'GRADO' | 'SECCION' | 'INDIVIDUAL';
  colegioNivelId: string | null;
  colegioGradoId: string | null;
  seccionId:      string | null;
  destinatarioId: string | null;
  añoAcademico:   number;
}

export interface NotificacionRepository {
  crearBulk(items: CrearNotificacionProps[]): Promise<void>;
  listarPorUsuario(usuarioId: string, soloNoLeidas?: boolean): Promise<Notificacion[]>;
  contarNoLeidas(usuarioId: string): Promise<number>;
  marcarLeida(id: string, usuarioId: string): Promise<void>;
  marcarTodasLeidas(usuarioId: string): Promise<void>;
  resolverDestinatarios(audiencia: AudienciaComunicado): Promise<string[]>;
}
