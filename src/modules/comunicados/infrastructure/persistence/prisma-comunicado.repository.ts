import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  ComunicadoRepository,
  CrearComunicadoProps,
  ActualizarComunicadoProps,
} from '../../domain/repositories/comunicado.repository';
import { Comunicado, EstadoComunicado } from '../../domain/entities/comunicado.entity';
import { ComunicadoLectura } from '../../domain/entities/comunicado-lectura.entity';
import { ComunicadoMapper } from './comunicado.mapper';

@Injectable()
export class PrismaComunicadoRepository implements ComunicadoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(props: CrearComunicadoProps): Promise<Comunicado> {
    const raw = await this.prisma.comunicado.create({
      data: {
        colegioId:      props.colegioId,
        titulo:         props.titulo,
        contenido:      props.contenido,
        autorId:        props.autorId,
        audiencia:      props.audiencia,
        colegioNivelId: props.colegioNivelId,
        colegioGradoId: props.colegioGradoId,
        seccionId:      props.seccionId,
        destinatarioId: props.destinatarioId,
        añoAcademico:   props.añoAcademico,
      },
    });
    return ComunicadoMapper.toDomain(raw);
  }

  async buscarPorId(id: string): Promise<Comunicado | null> {
    const raw = await this.prisma.comunicado.findUnique({ where: { id } });
    return raw ? ComunicadoMapper.toDomain(raw) : null;
  }

  async listarPorColegio(colegioId: string, año?: number): Promise<Comunicado[]> {
    const rows = await this.prisma.comunicado.findMany({
      where: {
        colegioId,
        ...(año ? { añoAcademico: año } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(ComunicadoMapper.toDomain);
  }

  async actualizar(id: string, props: ActualizarComunicadoProps): Promise<Comunicado> {
    const raw = await this.prisma.comunicado.update({
      where: { id },
      data: {
        ...(props.titulo         !== undefined && { titulo:         props.titulo }),
        ...(props.contenido      !== undefined && { contenido:      props.contenido }),
        ...(props.audiencia      !== undefined && { audiencia:      props.audiencia }),
        ...(props.colegioNivelId !== undefined && { colegioNivelId: props.colegioNivelId }),
        ...(props.colegioGradoId !== undefined && { colegioGradoId: props.colegioGradoId }),
        ...(props.seccionId      !== undefined && { seccionId:      props.seccionId }),
        ...(props.destinatarioId !== undefined && { destinatarioId: props.destinatarioId }),
      },
    });
    return ComunicadoMapper.toDomain(raw);
  }

  async cambiarEstado(
    id: string,
    estado: EstadoComunicado,
    publicadoEn?: Date,
  ): Promise<Comunicado> {
    const raw = await this.prisma.comunicado.update({
      where: { id },
      data: {
        estado,
        ...(publicadoEn && { publicadoEn }),
      },
    });
    return ComunicadoMapper.toDomain(raw);
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.comunicado.delete({ where: { id } });
  }

  async listarParaApoderado(
    apoderadoId: string,
    colegioId: string,
    año: number,
  ): Promise<Comunicado[]> {
    const rows = await this.prisma.comunicado.findMany({
      where: {
        colegioId,
        añoAcademico: año,
        estado: 'PUBLICADO',
        OR: [
          // Comunicado para todo el colegio
          { audiencia: 'COLEGIO' },
          // Comunicado para un nivel: algún alumno del apoderado está en ese nivel
          {
            audiencia: 'NIVEL',
            colegioNivel: {
              grados: {
                some: {
                  secciones: {
                    some: {
                      matriculas: {
                        some: {
                          añoAcademico: año,
                          perfilAlumno: {
                            apoderados: { some: { apoderadoId } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          // Comunicado para un grado
          {
            audiencia: 'GRADO',
            colegioGrado: {
              secciones: {
                some: {
                  matriculas: {
                    some: {
                      añoAcademico: año,
                      perfilAlumno: {
                        apoderados: { some: { apoderadoId } },
                      },
                    },
                  },
                },
              },
            },
          },
          // Comunicado para una sección
          {
            audiencia: 'SECCION',
            seccion: {
              matriculas: {
                some: {
                  añoAcademico: año,
                  perfilAlumno: {
                    apoderados: { some: { apoderadoId } },
                  },
                },
              },
            },
          },
          // Comunicado individual
          {
            audiencia: 'INDIVIDUAL',
            destinatarioId: apoderadoId,
          },
        ],
      },
      orderBy: { publicadoEn: 'desc' },
    });
    return rows.map(ComunicadoMapper.toDomain);
  }

  async marcarLeido(comunicadoId: string, apoderadoId: string): Promise<ComunicadoLectura> {
    const raw = await this.prisma.comunicadoLectura.create({
      data: { comunicadoId, apoderadoId },
    });
    return ComunicadoMapper.lecturaToDomain(raw);
  }

  async buscarLectura(
    comunicadoId: string,
    apoderadoId: string,
  ): Promise<ComunicadoLectura | null> {
    const raw = await this.prisma.comunicadoLectura.findUnique({
      where: { comunicadoId_apoderadoId: { comunicadoId, apoderadoId } },
    });
    return raw ? ComunicadoMapper.lecturaToDomain(raw) : null;
  }
}
