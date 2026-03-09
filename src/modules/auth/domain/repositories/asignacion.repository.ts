// Qué es: Contrato para cargar las asignaciones de un usuario.
// Por qué en dominio de Auth: Login necesita conocer los contextos del usuario
// para generar el JWT correcto. Dependency Inversion — use case depende de
// la interfaz, no de Prisma.

import { Asignacion } from '../entities/asignacion.entity';

export const ASIGNACION_REPOSITORY = 'AsignacionRepository';

export interface AsignacionRepository {
  findByUsuario(usuarioId: string): Promise<Asignacion[]>;
  findById(id: string):             Promise<Asignacion | null>;
}