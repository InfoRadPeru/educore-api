import { HorarioSeccion, EstadoHorario } from '../entities/horario-seccion.entity';
import { HorarioBloque, DiaSemana } from '../entities/horario-bloque.entity';

export const HORARIO_REPOSITORY = 'HORARIO_REPOSITORY';

export interface HorarioBloqueConDetalle extends HorarioBloque {
  asignaturaNombre: string;
  docenteNombre:    string;
  franjaHoraInicio: string;
  franjaHoraFin:    string;
  franjaNombre:     string;
}

export interface HorarioSeccionConBloques {
  horario: HorarioSeccion;
  bloques: HorarioBloqueConDetalle[];
}

export interface AgregarBloqueProps {
  horarioSeccionId:    string;
  docenteAsignacionId: string;
  franjaHorariaId:     string;
  diaSemana:           DiaSemana;
  aula?:               string;
}

export interface ActualizarBloqueProps {
  docenteAsignacionId?: string;
  franjaHorariaId?:     string;
  diaSemana?:           DiaSemana;
  aula?:                string | null;
}

export interface ConflictoDocente {
  docenteId:      string;
  dia:            DiaSemana;
  franjaHorariaId: string;
}

export interface HorarioRepository {
  // Horario
  crearHorario(seccionId: string, añoAcademico: number, generadoAuto: boolean): Promise<HorarioSeccion>;
  buscarHorarioPorSeccion(seccionId: string, añoAcademico: number): Promise<HorarioSeccion | null>;
  buscarHorarioPorId(id: string): Promise<HorarioSeccion | null>;
  listarHorariosPorColegio(colegioId: string, añoAcademico: number): Promise<HorarioSeccion[]>;
  cambiarEstadoHorario(id: string, estado: EstadoHorario): Promise<HorarioSeccion>;
  eliminarHorario(id: string): Promise<void>;

  // Bloques
  obtenerHorarioConBloques(horarioSeccionId: string): Promise<HorarioSeccionConBloques | null>;
  agregarBloque(props: AgregarBloqueProps): Promise<HorarioBloque>;
  agregarBloques(bloques: AgregarBloqueProps[]): Promise<HorarioBloque[]>;
  buscarBloque(id: string): Promise<HorarioBloque | null>;
  actualizarBloque(id: string, props: ActualizarBloqueProps): Promise<HorarioBloque>;
  eliminarBloque(id: string): Promise<void>;
  eliminarBloquesPorHorario(horarioSeccionId: string): Promise<void>;

  // Conflictos
  verificarConflictoSeccion(horarioSeccionId: string, dia: DiaSemana, franjaHorariaId: string, excluirBloqueId?: string): Promise<boolean>;
  obtenerConflictosDocente(docenteId: string, añoAcademico: number): Promise<ConflictoDocente[]>;
  verificarConflictoDocente(docenteId: string, dia: DiaSemana, franjaHorariaId: string, añoAcademico: number, excluirBloqueId?: string): Promise<boolean>;
}
