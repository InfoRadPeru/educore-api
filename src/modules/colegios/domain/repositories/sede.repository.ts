// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Contrato del repositorio del agregado Sede.
//
// POR QUÉ SEPARADO DE ColegioRepository:
//   Sede es un agregado distinto al Colegio. Tiene su propio ciclo
//   de vida, sus propias reglas (activo/inactivo) y sus propios
//   use cases. Mezclarlos en un solo repositorio viola ISP y SRP.
//
// POR QUÉ contarActivas ESTÁ AQUÍ Y NO EN ColegioRepository:
//   contarActivas es una consulta sobre Sedes — le pertenece a
//   SedeRepository. CrearSedeUseCase la necesita para validar el
//   límite de plan, pero eso no significa que deba vivir en Colegio.
//
// NOTA SOBRE FUTURO:
//   Si Sede crece y necesita su propio módulo, este repositorio
//   ya está listo para moverse sin cambiar los use cases.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Sede } from '../entities/sede.entity';

export const SEDE_REPOSITORY = 'SedeRepository';

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

export interface SedeRepository {
  buscarPorColegio(colegioId: string):                            Promise<Sede[]>;
  buscarPorId(id: string, colegioId: string):                    Promise<Sede | null>;
  contarActivas(colegioId: string):                              Promise<number>;
  crear(props: CrearSedeProps):                                  Promise<Sede>;
  actualizar(id: string, props: ActualizarSedeProps):            Promise<Sede>;
  cambiarEstado(id: string, activo: boolean):                    Promise<Sede>;
}