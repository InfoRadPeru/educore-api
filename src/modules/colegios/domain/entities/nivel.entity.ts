// Tipo discriminado — dos estados posibles para un nivel:
// - NivelDisponible: existe en el catálogo pero el colegio aún no lo activó
// - NivelActivado: el colegio ya lo activó, tiene id propio de ColegioNivel
//
// Por qué tipo discriminado y no id vacío:
// Con id: '' TypeScript no puede ayudarte — cualquier código puede llamar .id
// y obtener un string vacío sin error. Con el discriminado, TypeScript te obliga
// a verificar el tipo antes de acceder a propiedades exclusivas de cada estado.

export interface NivelDisponible {
  tipo:           'disponible';
  nivelMaestroId: string;
  nombre:         string;
  orden:          number;
}

export interface NivelActivado {
  tipo:           'activado';
  id:             string;
  nivelMaestroId: string;
  nombre:         string;
  orden:          number;
  activo:         boolean;
  turnos:         string[];
}

export type Nivel = NivelDisponible | NivelActivado;