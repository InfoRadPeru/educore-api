import { PublicacionBoletin } from '../entities/publicacion-boletin.entity';

export const PUBLICACION_BOLETIN_REPOSITORY = 'PUBLICACION_BOLETIN_REPOSITORY';

export interface CrearPublicacionProps {
  periodoId:     string;
  seccionId:     string;
  publicadoPorId: string;
}

export interface PublicacionBoletinRepository {
  crear(props: CrearPublicacionProps): Promise<PublicacionBoletin>;
  buscarPorPeriodoYSeccion(periodoId: string, seccionId: string): Promise<PublicacionBoletin | null>;
  listarPorSeccion(seccionId: string): Promise<PublicacionBoletin[]>;
  eliminar(periodoId: string, seccionId: string): Promise<void>;
  estaPublicado(periodoId: string, seccionId: string): Promise<boolean>;
}
