// Qué es: Implementación concreta del contrato UsuarioRepository.
// Patrón: Repository Pattern. La interfaz vive en Domain, la implementación en Infrastructure.
// Principio: Dependency Inversion — Domain define el contrato, Infrastructure lo implementa. Si mañana cambias Prisma por TypeORM, solo tocas este archivo.
// Por qué el mapper está aquí: La conversión de modelo Prisma a entidad de dominio es responsabilidad de Infrastructure. Domain no sabe que Prisma existe.

import { Usuario } from "@modules/auth/domain/entities/usuario.entity";
import { CrearUsuarioProps, UsuarioRepository } from "@modules/auth/domain/repositories/usuario.repository";
import { Email } from "@modules/auth/domain/value-objects/email.vo";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { UsuarioMapper } from "./usuario.mapper";

// Include requerido en todas las queries — persona tiene nombres/apellidos
const INCLUDE_PERSONA = { persona: { select: { nombres: true, apellidos: true, telefono: true, avatarUrl: true } } } as const;

@Injectable()
export class PrismaUsuarioRepository implements UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorEmail(email: Email): Promise<Usuario | null> {
    const raw = await this.prisma.usuario.findUnique({
      where:   { email: email.value },
      include: INCLUDE_PERSONA,
    });
    return raw ? UsuarioMapper.toDomain(raw) : null;
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const raw = await this.prisma.usuario.findUnique({
      where:   { id },
      include: INCLUDE_PERSONA,
    });
    return raw ? UsuarioMapper.toDomain(raw) : null;
  }

  async existePorEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.usuario.count({ where: { email: email.value } });
    return count > 0;
  }

  async crear(props: CrearUsuarioProps): Promise<Usuario> {
    // Usuario en Prisma requiere crear la Persona primero (relación 1:1 obligatoria)
    const raw = await this.prisma.usuario.create({
      data: {
        email:        props.email.value,
        passwordHash: props.passwordHash,
        persona: {
          create: {
            nombres:   props.nombres,
            apellidos: props.apellidos,
            telefono:  props.telefono ?? null,
            // dni, fechaNac, genero son requeridos en el schema — necesitamos valores default para el registro inicial
            dni:       `PENDIENTE-${Date.now()}`, // el usuario completará su perfil después
            fechaNac:  new Date('2000-01-01'),
            genero:    'OTRO',
          },
        },
      },
      include: INCLUDE_PERSONA,
    });
    return UsuarioMapper.toDomain(raw);
  }

  async incrementarIntentosFallidos(id: string): Promise<void> {
    await this.prisma.usuario.update({ where: { id }, data: { intentosFallidos: { increment: 1 } } });
  }

  async bloquearCuenta(id: string, hasta: Date): Promise<void> {
    await this.prisma.usuario.update({ where: { id }, data: { bloqueadoHasta: hasta, intentosFallidos: 0 } });
  }

  async resetearIntentosFallidos(id: string): Promise<void> {
    await this.prisma.usuario.update({ where: { id }, data: { intentosFallidos: 0, bloqueadoHasta: null } });
  }

  async actualizarUltimoAcceso(id: string): Promise<void> {
    await this.prisma.usuario.update({ where: { id }, data: { ultimoAcceso: new Date() } });
  }

  async actualizarPassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.usuario.update({ where: { id }, data: { passwordHash } });
  }
}