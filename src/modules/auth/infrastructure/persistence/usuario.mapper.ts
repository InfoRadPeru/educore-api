import { Usuario } from "@modules/auth/domain/entities/usuario.entity";
import { EstadoUsuario } from "@modules/auth/domain/enums/estado-usuario.enum";
import { Email } from "@modules/auth/domain/value-objects/email.vo";

// Tipo inferido de Prisma para no acoplar al import directo de PrismaClient
type UsuarioPrisma = {
  id: string; username: string | null; email: string; passwordHash: string;
  estado: string; intentosFallidos: number;
  bloqueadoHasta: Date | null; ultimoAcceso: Date | null;
  esPlatformAdmin: boolean; createdAt: Date;
  persona: {
    nombres: string; apellidos: string;
    telefono: string | null; avatarUrl: string | null;
  };
};

export class UsuarioMapper {
  static toDomain(raw: UsuarioPrisma): Usuario {
    const emailResult = Email.create(raw.email);
    if (!emailResult.ok) {
      throw new Error(`Email inválido en BD para usuario ${raw.id}`);
    }

    return Usuario.reconstitute({
      id:               raw.id,
      username:         raw.username,
      email:            emailResult.value,
      passwordHash:     raw.passwordHash,
      nombres:          raw.persona.nombres,
      apellidos:        raw.persona.apellidos,
      telefono:         raw.persona.telefono,
      avatarUrl:        raw.persona.avatarUrl,
      estado:           raw.estado as EstadoUsuario,
      intentosFallidos: raw.intentosFallidos,
      bloqueadoHasta:   raw.bloqueadoHasta,
      ultimoAcceso:     raw.ultimoAcceso,
      esPlatformAdmin:  raw.esPlatformAdmin,
      createdAt:         raw.createdAt,
    });
  }
}