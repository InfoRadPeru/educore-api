import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  NotificacionRepository,
  CrearNotificacionProps,
  AudienciaComunicado,
} from '../../domain/repositories/notificacion.repository';
import { Notificacion } from '../../domain/entities/notificacion.entity';
import { NotificacionMapper } from './notificacion.mapper';

@Injectable()
export class PrismaNotificacionRepository implements NotificacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crearBulk(items: CrearNotificacionProps[]): Promise<void> {
    await this.prisma.notificacion.createMany({
      data: items.map((i) => ({
        usuarioId:   i.usuarioId,
        tipo:        i.tipo as any,
        titulo:      i.titulo,
        mensaje:     i.mensaje,
        entidadTipo: i.entidadTipo ?? null,
        entidadId:   i.entidadId  ?? null,
      })),
      skipDuplicates: true,
    });
  }

  async listarPorUsuario(usuarioId: string, soloNoLeidas = false): Promise<Notificacion[]> {
    const rows = await this.prisma.notificacion.findMany({
      where: { usuarioId, ...(soloNoLeidas ? { leida: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map(NotificacionMapper.toDomain);
  }

  async contarNoLeidas(usuarioId: string): Promise<number> {
    return this.prisma.notificacion.count({ where: { usuarioId, leida: false } });
  }

  async marcarLeida(id: string, usuarioId: string): Promise<void> {
    await this.prisma.notificacion.updateMany({
      where: { id, usuarioId },
      data:  { leida: true },
    });
  }

  async marcarTodasLeidas(usuarioId: string): Promise<void> {
    await this.prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data:  { leida: true },
    });
  }

  async resolverDestinatarios(a: AudienciaComunicado): Promise<string[]> {
    let rows: { id: string }[] = [];

    switch (a.audiencia) {
      case 'COLEGIO':
        // All apoderados whose alumnos are in this colegio
        rows = await this.prisma.usuario.findMany({
          where: {
            persona: {
              perfilApoderado: {
                alumnos: { some: { alumno: { colegioId: a.colegioId } } },
              },
            },
          },
          select: { id: true },
        });
        break;

      case 'NIVEL':
        rows = await this.prisma.usuario.findMany({
          where: {
            persona: {
              perfilApoderado: {
                alumnos: {
                  some: {
                    alumno: {
                      matriculas: {
                        some: {
                          seccion: {
                            colegioGrado: { colegioNivelId: a.colegioNivelId! },
                          },
                          añoAcademico: a.añoAcademico,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          select: { id: true },
        });
        break;

      case 'GRADO':
        rows = await this.prisma.usuario.findMany({
          where: {
            persona: {
              perfilApoderado: {
                alumnos: {
                  some: {
                    alumno: {
                      matriculas: {
                        some: {
                          seccion: { colegioGradoId: a.colegioGradoId! },
                          añoAcademico: a.añoAcademico,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          select: { id: true },
        });
        break;

      case 'SECCION':
        rows = await this.prisma.usuario.findMany({
          where: {
            persona: {
              perfilApoderado: {
                alumnos: {
                  some: {
                    alumno: {
                      matriculas: {
                        some: {
                          seccionId:    a.seccionId!,
                          añoAcademico: a.añoAcademico,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          select: { id: true },
        });
        break;

      case 'INDIVIDUAL': {
        // destinatarioId = PerfilApoderado.id → lookup Usuario
        const row = await this.prisma.usuario.findFirst({
          where: {
            persona: {
              perfilApoderado: { id: a.destinatarioId! },
            },
          },
          select: { id: true },
        });
        rows = row ? [row] : [];
        break;
      }
    }

    return rows.map((r) => r.id);
  }
}
