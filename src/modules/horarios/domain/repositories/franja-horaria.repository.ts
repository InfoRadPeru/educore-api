import { FranjaHoraria } from '../entities/franja-horaria.entity';

export const FRANJA_HORARIA_REPOSITORY = 'FRANJA_HORARIA_REPOSITORY';

export interface CrearFranjaProps {
  colegioId:  string;
  nombre:     string;
  horaInicio: string;
  horaFin:    string;
  orden:      number;
}

export interface ActualizarFranjaProps {
  nombre?:     string;
  horaInicio?: string;
  horaFin?:    string;
  orden?:      number;
  activo?:     boolean;
}

export interface FranjaHorariaRepository {
  crear(props: CrearFranjaProps): Promise<FranjaHoraria>;
  buscarPorId(id: string): Promise<FranjaHoraria | null>;
  listarPorColegio(colegioId: string): Promise<FranjaHoraria[]>;
  actualizar(id: string, props: ActualizarFranjaProps): Promise<FranjaHoraria>;
  eliminar(id: string): Promise<void>;
  tieneBloques(id: string): Promise<boolean>;
}
