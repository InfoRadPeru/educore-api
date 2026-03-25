import { Notificacion } from '../../domain/entities/notificacion.entity';

type NotificacionPrisma = {
  id:          string;
  usuarioId:   string;
  tipo:        string;
  titulo:      string;
  mensaje:     string;
  entidadTipo: string | null;
  entidadId:   string | null;
  leida:       boolean;
  createdAt:   Date;
};

export class NotificacionMapper {
  static toDomain(row: NotificacionPrisma): Notificacion {
    return Notificacion.reconstitute({
      id:          row.id,
      usuarioId:   row.usuarioId,
      tipo:        row.tipo as any,
      titulo:      row.titulo,
      mensaje:     row.mensaje,
      entidadTipo: row.entidadTipo,
      entidadId:   row.entidadId,
      leida:       row.leida,
      createdAt:   row.createdAt,
    });
  }
}
