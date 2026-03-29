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
//   $transaction garantiza atomicidad: persona + usuario + colegio + rol + asignación
//   se crean todos o no se crea ninguno.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Asignacion } from '@modules/auth/domain/entities/asignacion.entity';
import {
  ColegioInicialCreadoResult,
  CrearColegioInicialProps,
  OnboardingPort,
} from '@modules/auth/domain/ports/onboarding.port';
import { ConflictError } from '@shared/domain/result';

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

    try {
      const resultado = await this.prisma.$transaction(async (tx) => {

        // Paso 1: Crear persona + usuario del SUPER_ADMIN
        const usuario = await tx.usuario.create({
          data: {
            email:        props.usuarioEmail,
            passwordHash: props.usuarioPassword,
            persona: {
              create: {
                dni:       props.usuarioDni,
                nombres:   props.usuarioNombres,
                apellidos: props.usuarioApellidos,
                telefono:  props.usuarioTelefono ?? null,
                fechaNac:  new Date('2000-01-01'),
                genero:    'OTRO',
              },
            },
          },
          include: { persona: { select: { nombres: true, apellidos: true } } },
        });

        // Paso 2: Crear el colegio
        const colegio = await tx.colegio.create({
          data: {
            nombre:    props.nombre,
            ruc:       props.ruc,
            direccion: props.direccion,
            email:     props.email,
          },
        });

        // Paso 3: Crear el rol SUPER_ADMIN del colegio
        const rol = await tx.colegioRol.create({
          data: {
            colegioId:   colegio.id,
            nombre:      'SUPER_ADMIN',
            descripcion: 'Administrador general del colegio',
            esSistema:   true,
          },
        });

        // Paso 4: Crear la asignación usuario → colegio → rol
        const asignacion = await tx.usuarioAsignacion.create({
          data: {
            usuarioId: usuario.id,
            colegioId: colegio.id,
            sedeId:    null,
            rolId:     rol.id,
          },
        });

        return { usuario, colegio, rol, asignacion };
      });

      return {
        colegioId:  resultado.colegio.id,
        usuarioId:  resultado.usuario.id,
        email:      resultado.usuario.email,
        nombres:    resultado.usuario.persona!.nombres,
        apellidos:  resultado.usuario.persona!.apellidos,
        asignacion: Asignacion.reconstitute({
          id:            resultado.asignacion.id,
          usuarioId:     resultado.usuario.id,
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
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictError('Ya existe un registro con esos datos (email, DNI o RUC duplicado)');
      }
      throw error;
    }
  }
}

function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'P2002'
  );
}