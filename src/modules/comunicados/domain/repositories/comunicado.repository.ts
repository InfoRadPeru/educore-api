import { Comunicado, EstadoComunicado, AudienciaComunicado } from '../entities/comunicado.entity';
import { ComunicadoLectura } from '../entities/comunicado-lectura.entity';

export const COMUNICADO_REPOSITORY = 'COMUNICADO_REPOSITORY';

export interface CrearComunicadoProps {
  colegioId:       string;
  titulo:          string;
  contenido:       string;
  autorId:         string;
  audiencia:       AudienciaComunicado;
  colegioNivelId?: string;
  colegioGradoId?: string;
  seccionId?:      string;
  destinatarioId?: string;
  añoAcademico:    number;
}

export interface ActualizarComunicadoProps {
  titulo?:         string;
  contenido?:      string;
  audiencia?:      AudienciaComunicado;
  colegioNivelId?: string | null;
  colegioGradoId?: string | null;
  seccionId?:      string | null;
  destinatarioId?: string | null;
}

export interface ComunicadoRepository {
  crear(props: CrearComunicadoProps): Promise<Comunicado>;
  buscarPorId(id: string): Promise<Comunicado | null>;
  listarPorColegio(colegioId: string, año?: number): Promise<Comunicado[]>;
  actualizar(id: string, props: ActualizarComunicadoProps): Promise<Comunicado>;
  cambiarEstado(id: string, estado: EstadoComunicado, publicadoEn?: Date): Promise<Comunicado>;
  eliminar(id: string): Promise<void>;
  listarParaApoderado(apoderadoId: string, colegioId: string, año: number): Promise<Comunicado[]>;
  marcarLeido(comunicadoId: string, apoderadoId: string): Promise<ComunicadoLectura>;
  buscarLectura(comunicadoId: string, apoderadoId: string): Promise<ComunicadoLectura | null>;
}
