// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Adapter que implementa el OnboardingPort usando Prisma.
//   Vive en Infrastructure — la única capa que puede conocer Prisma.
//
// PATRÓN: Ports & Adapters.
//   El Port (contrato) vive en Domain.
//   El Adapter (implementación) vive en Infrastructure.
//   Auth depende del Port, nunca del Adapter directamente.
//
// POR QUÉ SE LLAMA "ADAPTER" Y NO "REPOSITORY":
//   No representa un agregado de dominio de Auth.
//   Es un adaptador que conecta Auth con la lógica de Colegios
//   a través de la base de datos. Nombrar las cosas correctamente
//   comunica la intención del código.
//
// TRANSACCIÓN:
//   $transaction garantiza atomicidad: colegio + rol + asignación
//   se crean todos o no se crea ninguno.
//   Si falla el paso 2 (rol), el colegio creado en el paso 1 se revierte.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Asignacion } from '@modules/auth/domain/entities/asignacion.entity';
import {
  ColegioInicialCreadoResult,
  CrearColegioInicialProps,
  OnboardingPort,
} from '@modules/auth/domain/ports/onboarding.port';

@Injectable()
export class OnboardingAdapter implements OnboardingPort {

  constructor(private readonly prisma: PrismaService) {}

  async existeColegioConRuc(ruc: string): Promise<boolean> {
    const count = await this.prisma.colegio.count({ where: { ruc } });
    return count > 0;
  }

  async crearColegioConSuperAdmin(
    props: CrearColegioInicialProps,
  ): Promise<ColegioInicialCreadoResult> {

    const resultado = await this.prisma.$transaction(async (tx) => {

      // Paso 1: Crear el colegio
      const colegio = await tx.colegio.create({
        data: {
          nombre:    props.nombre,
          ruc:       props.ruc,
          direccion: props.direccion,
          email:     props.email,
        },
      });

      // Paso 2: Crear el rol SUPER_ADMIN del colegio
      // esSistema = true → acceso total sin permisos individuales
      // Los permisos granulares los configura el SUPER_ADMIN después
      const rol = await tx.colegioRol.create({
        data: {
          colegioId:   colegio.id,
          nombre:      'SUPER_ADMIN',
          descripcion: 'Administrador general del colegio',
          esSistema:   true,
        },
      });

      // Paso 3: Crear la asignación usuario → colegio → rol
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
      colegioId: resultado.colegio.id,
      asignacion: Asignacion.reconstitute({
        id:            resultado.asignacion.id,
        usuarioId:     resultado.asignacion.usuarioId,
        colegioId:     resultado.colegio.id,
        colegioNombre: resultado.colegio.nombre,
        sedeId:        null,
        sedeNombre:    null,
        rolId:         resultado.rol.id,
        rolNombre:     'SUPER_ADMIN',
        esSistema:     true,
        permisos:      [],
        activo:        true,
      }),
    };
  }
}