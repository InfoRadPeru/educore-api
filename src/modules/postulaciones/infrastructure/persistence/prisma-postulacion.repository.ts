import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Postulacion, EstadoPostulacion } from '../../domain/entities/postulacion.entity';
import { ActualizarPostulacionProps, CrearPostulacionProps, PostulacionRepository } from '../../domain/repositories/postulacion.repository';
import { PostulacionMapper } from './postulacion.mapper';

@Injectable()
export class PrismaPostulacionRepository implements PostulacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(props: CrearPostulacionProps): Promise<Postulacion> {
    const raw = await this.prisma.postulacion.create({
      data: {
        colegioId: props.colegioId, sedeId: props.sedeId ?? null,
        nombres: props.nombres, apellidos: props.apellidos, dni: props.dni,
        fechaNac: props.fechaNac, genero: props.genero as any,
        colegioNivelId: props.colegioNivelId, añoAcademico: props.añoAcademico,
        observaciones: props.observaciones ?? null,
      },
    });
    return PostulacionMapper.toDomain(raw);
  }

  async buscarPorId(id: string): Promise<Postulacion | null> {
    const raw = await this.prisma.postulacion.findUnique({ where: { id } });
    return raw ? PostulacionMapper.toDomain(raw) : null;
  }

  async listarPorColegio(colegioId: string, estado?: EstadoPostulacion): Promise<Postulacion[]> {
    const raw = await this.prisma.postulacion.findMany({
      where: { colegioId, ...(estado ? { estado: estado as any } : {}) },
      orderBy: { createdAt: 'desc' },
    });
    return raw.map(r => PostulacionMapper.toDomain(r));
  }

  async actualizar(id: string, props: ActualizarPostulacionProps): Promise<Postulacion> {
    const raw = await this.prisma.postulacion.update({
      where: { id },
      data: {
        ...(props.estado          !== undefined && { estado: props.estado as any }),
        ...(props.observaciones   !== undefined && { observaciones: props.observaciones }),
        ...(props.perfilAlumnoId  !== undefined && { perfilAlumnoId: props.perfilAlumnoId }),
      },
    });
    return PostulacionMapper.toDomain(raw);
  }
}
