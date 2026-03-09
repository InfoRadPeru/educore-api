// Qué es: Contrato para operaciones de colegio dentro del módulo Auth.
// Por qué en Auth y no en un módulo Colegios: Register crea colegio + rol +
// asignación en una transacción. Auth es el dueño de ese flujo de onboarding.
// Cuando exista el módulo Colegios, extenderá este contrato.

import { Asignacion } from '../entities/asignacion.entity';

export const COLEGIO_REPOSITORY = 'ColegioRepository';

export interface CrearColegioConSuperAdminProps {
  nombre:    string;
  ruc:       string;
  direccion: string;
  email:     string;
  usuarioId: string;
}

export interface ColegioRepository {
  existsByRuc(ruc: string):                                               Promise<boolean>;
  crearColegioConSuperAdmin(props: CrearColegioConSuperAdminProps):       Promise<{ colegioId: string; asignacion: Asignacion }>;
}