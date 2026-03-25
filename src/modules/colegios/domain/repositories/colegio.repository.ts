// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Contrato del repositorio del agregado Colegio.
//
// QUÉ CAMBIÓ vs versión anterior:
//   Antes: 20 métodos mezclando Colegio + Sede + Nivel + Config + Plan.
//   Ahora: solo métodos del agregado Colegio.
//   Sede → sede.repository.ts
//   Nivel → nivel.repository.ts
//
// PRINCIPIO SOLID — Interface Segregation (ISP):
//   "Los clientes no deben depender de interfaces que no usan."
//   Un use case de Sedes no debería conocer los métodos de Niveles.
//   Contratos pequeños y enfocados son más fáciles de testear,
//   mockear y razonar sobre ellos.
//
// POR QUÉ TIPOS EN VEZ DE string:
//   cambiarEstado y cambiarPlan antes aceptaban string.
//   Ahora usan EstadoColegio y PlanColegio — los tipos ya definidos
//   en la entidad. TypeScript atrapa errores de typo en compile time.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Colegio, EstadoColegio, PlanColegio } from '../entities/colegio.entity';

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

// ColegioConfiguracion vive aquí porque es un value object
// del agregado Colegio — no tiene identidad propia relevante fuera de él
export interface ColegioConfiguracion {
  id:              string;
  logoUrl:         string | null;
  colorPrimario:   string | null;
  colorSecundario: string | null;
  periodo:         string;
  zonaHoraria:     string;
  moneda:          string;
  notaMinima:      number;
  notaMaxima:      number;
  notaAprobatoria: number;
  decimalesNota:   number;
}

export interface ColegioRepository {
  buscarPorId(id: string):                                              Promise<Colegio | null>;
  buscarTodos():                                                        Promise<Colegio[]>;
  actualizar(id: string, props: ActualizarColegioProps):               Promise<Colegio>;
  cambiarEstado(id: string, estado: EstadoColegio):                    Promise<Colegio>;
  cambiarPlan(id: string, plan: PlanColegio):                          Promise<Colegio>;
  buscarConfiguracion(colegioId: string):                              Promise<ColegioConfiguracion | null>;
  actualizarConfiguracion(colegioId: string, props: ActualizarConfiguracionProps): Promise<ColegioConfiguracion>;
}