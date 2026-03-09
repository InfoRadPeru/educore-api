// Qué es: Contrato del repositorio de Colegio.
// Patrón: Repository Pattern (DDD).
// Principio SOLID: Dependency Inversion — use cases dependen de esta interfaz, no de Prisma.

import { Colegio } from '../entities/colegio.entity';
import { Sede } from '../entities/sede.entity';
import { Nivel } from '../entities/nivel.entity';

export const COLEGIO_REPOSITORY = 'ColegioRepository';

export interface ActualizarColegioProps {
  direccion?: string;
  telefono?:  string;
  email?:     string;
}

export interface ActualizarConfiguracionProps {
  logoUrl?:         string;
  colorPrimario?:   string;
  colorSecundario?: string;
  periodo?:         string;
  zonaHoraria?:     string;
  moneda?:          string;
}

export interface CrearSedeProps {
  colegioId: string;
  nombre:    string;
  direccion: string;
  telefono?: string;
  email?:    string;
}

export interface ActualizarSedeProps {
  nombre?:    string;
  direccion?: string;
  telefono?:  string;
  email?:     string;
}

export interface ColegioConfiguracion {
  id:              string;
  logoUrl:         string | null;
  colorPrimario:   string | null;
  colorSecundario: string | null;
  periodo:         string;
  zonaHoraria:     string;
  moneda:          string;
}

export interface PlanInfo {
  plan:               string;
  planVenceEn:        Date | null;
  limitesSedes:       number;
  sedesActivas:       number;
  limitesSeccionesPorGrado: number | null;
  planSugerido:       string | null;
}

export interface ColegioRepository {
  findById(id: string):                               Promise<Colegio | null>;
  findAll():                                          Promise<Colegio[]>;
  actualizar(id: string, props: ActualizarColegioProps): Promise<Colegio>;
  cambiarEstado(id: string, estado: string):          Promise<Colegio>;
  cambiarPlan(id: string, plan: string):              Promise<Colegio>;

  findConfiguracion(colegioId: string):               Promise<ColegioConfiguracion | null>;
  actualizarConfiguracion(colegioId: string, props: ActualizarConfiguracionProps): Promise<ColegioConfiguracion>;

  findPlanInfo(colegioId: string):                    Promise<PlanInfo>;

  findSedes(colegioId: string):                       Promise<Sede[]>;
  findSedeById(id: string, colegioId: string):        Promise<Sede | null>;
  contarSedesActivas(colegioId: string):              Promise<number>;
  crearSede(props: CrearSedeProps):                   Promise<Sede>;
  actualizarSede(id: string, props: ActualizarSedeProps): Promise<Sede>;
  cambiarEstadoSede(id: string, activo: boolean):     Promise<Sede>;

  findNiveles(colegioId: string):                     Promise<Nivel[]>;
  findNivelById(id: string, colegioId: string):       Promise<Nivel | null>;
  cambiarEstadoNivel(id: string, activo: boolean):    Promise<Nivel>;
  activarNivel(colegioId: string, nivelMaestroId: string): Promise<Nivel>;
}