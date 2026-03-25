// Qué es: Contrato (interfaz) del repositorio.
// Patrón: Repository Pattern (DDD).
// Principio SOLID: Dependency Inversion — los use cases dependen de esta interfaz, no de Prisma. Si mañana cambias la base de datos, los use cases no se tocan.

import { Usuario } from "../entities/usuario.entity";
import { Email } from "../value-objects/email.vo";

export const USUARIO_REPOSITORY = 'UsuarioRepository';

export interface CrearUsuarioProps {
  email:        Email;
  passwordHash: string;
  nombres:      string;
  apellidos:    string;
  telefono?:    string;
}

export interface CrearUsuarioConPersonaExistenteProps {
  personaId:    string;
  username:     string;
  email:        string;
  passwordHash: string;
}

export interface UsuarioRepository {
  buscarPorEmail(email: Email):                          Promise<Usuario | null>;
  buscarPorId(id: string):                               Promise<Usuario | null>;
  buscarPorIdentifier(identifier: string):               Promise<Usuario | null>;
  existePorEmail(email: Email):                          Promise<boolean>;
  crear(props: CrearUsuarioProps):                       Promise<Usuario>;
  crearParaPersona(props: CrearUsuarioConPersonaExistenteProps): Promise<Usuario>;
  incrementarIntentosFallidos(id: string):               Promise<number>;
  bloquearCuenta(id: string, bloqueadoHasta: Date):      Promise<void>;
  resetearIntentosFallidos(id: string):                  Promise<void>;
  actualizarUltimoAcceso(id: string):                    Promise<void>;
  actualizarPassword(id: string, hash: string):          Promise<void>;
}