// Qué es: Contrato (interfaz) del repositorio.
// Patrón: Repository Pattern (DDD).
// Principio SOLID: Dependency Inversion — los use cases dependen de esta interfaz, no de Prisma. Si mañana cambias la base de datos, los use cases no se tocan.

import { Usuario } from "../entities/usuario.entity";
import { Email } from "../value-objects/email.vo";

export const USUARIO_REPOSITORY = 'UsuarioRepository';

export interface CreateUsuarioProps {
  email:        Email;
  passwordHash: string;
  nombres:      string;
  apellidos:    string;
  telefono?:    string;
}

export interface UsuarioRepository {
  findByEmail(email: Email):                Promise<Usuario | null>;
  findById(id: string):                     Promise<Usuario | null>;
  existsByEmail(email: Email):              Promise<boolean>;
  create(props: CreateUsuarioProps):        Promise<Usuario>;
  incrementarIntentosFallidos(id: string):  Promise<void>;
  bloquearCuenta(id: string, hasta: Date):  Promise<void>;
  resetearIntentosFallidos(id: string):     Promise<void>;
  actualizarUltimoAcceso(id: string):       Promise<void>;
  updatePassword(id: string, hash: string): Promise<void>;
}