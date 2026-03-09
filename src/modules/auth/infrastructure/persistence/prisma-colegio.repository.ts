// Qué es: Implementación del ColegioRepository para el flujo de onboarding.
// crearColegioConSuperAdmin corre en una transacción:
//   1. Crea el colegio
//   2. Crea el rol SUPER_ADMIN con esSistema = true y SIN permisos hardcodeados
//   3. Crea la asignación usuario → colegio → rol
// esSistema = true es suficiente para que el guard le dé acceso total al colegio.
// Los permisos granulares los agrega el SUPER_ADMIN después desde el panel.

import { Asignacion } from "@modules/auth/domain/entities/asignacion.entity";
import { ColegioRepository, CrearColegioConSuperAdminProps } from "@modules/auth/domain/repositories/colegio.repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";

@Injectable()
export class PrismaColegioRepository implements ColegioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsByRuc(ruc: string): Promise<boolean> {
    const count = await this.prisma.colegio.count({ where: { ruc } });
    return count > 0;
  }

  async crearColegioConSuperAdmin(
    props: CrearColegioConSuperAdminProps,
  ): Promise<{ colegioId: string; asignacion: Asignacion }> {

    const result = await this.prisma.$transaction(async (tx) => {
      const colegio = await tx.colegio.create({
        data: {
          nombre:    props.nombre,
          ruc:       props.ruc,
          direccion: props.direccion,
          email:     props.email,
        },
      });

      // esSistema = true → acceso total sin necesidad de permisos individuales
      const rol = await tx.colegioRol.create({
        data: {
          colegioId:   colegio.id,
          nombre:      'SUPER_ADMIN',
          descripcion: 'Administrador general del colegio',
          esSistema:   true,
        },
      });

      const asignacion = await tx.usuarioAsignacion.create({
        data: {
          usuarioId: props.usuarioId,
          colegioId: colegio.id,
          sedeId:    null,
          rolId:     rol.id,
        },
      });

      return { colegio, rol, asignacion };
    });

    return {
      colegioId: result.colegio.id,
      asignacion: Asignacion.reconstitute({
        id:            result.asignacion.id,
        usuarioId:     result.asignacion.usuarioId,
        colegioId:     result.colegio.id,
        colegioNombre: result.colegio.nombre,
        sedeId:        null,
        sedeNombre:    null,
        rolId:         result.rol.id,
        rolNombre:     'SUPER_ADMIN',
        esSistema:     true,
        permisos:      [],
        activo:        true,
      }),
    };
  }
}