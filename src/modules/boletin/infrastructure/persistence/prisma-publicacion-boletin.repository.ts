import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  PublicacionBoletinRepository,
  CrearPublicacionProps,
} from '../../domain/repositories/publicacion-boletin.repository';
import { PublicacionBoletin } from '../../domain/entities/publicacion-boletin.entity';

@Injectable()
export class PrismaPublicacionBoletinRepository implements PublicacionBoletinRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: {
    id: string; periodoId: string; seccionId: string;
    publicadoEn: Date; publicadoPorId: string;
  }): PublicacionBoletin {
    return PublicacionBoletin.reconstitute({
      id:            raw.id,
      periodoId:     raw.periodoId,
      seccionId:     raw.seccionId,
      publicadoEn:   raw.publicadoEn,
      publicadoPorId: raw.publicadoPorId,
    });
  }

  async crear(props: CrearPublicacionProps): Promise<PublicacionBoletin> {
    const raw = await this.prisma.publicacionBoletin.create({
      data: {
        periodoId:     props.periodoId,
        seccionId:     props.seccionId,
        publicadoPorId: props.publicadoPorId,
      },
    });
    return this.toEntity(raw);
  }

  async buscarPorPeriodoYSeccion(
    periodoId: string,
    seccionId: string,
  ): Promise<PublicacionBoletin | null> {
    const raw = await this.prisma.publicacionBoletin.findUnique({
      where: { periodoId_seccionId: { periodoId, seccionId } },
    });
    return raw ? this.toEntity(raw) : null;
  }

  async listarPorSeccion(seccionId: string): Promise<PublicacionBoletin[]> {
    const rows = await this.prisma.publicacionBoletin.findMany({
      where: { seccionId },
      orderBy: { publicadoEn: 'desc' },
    });
    return rows.map(r => this.toEntity(r));
  }

  async eliminar(periodoId: string, seccionId: string): Promise<void> {
    await this.prisma.publicacionBoletin.delete({
      where: { periodoId_seccionId: { periodoId, seccionId } },
    });
  }

  async estaPublicado(periodoId: string, seccionId: string): Promise<boolean> {
    const count = await this.prisma.publicacionBoletin.count({
      where: { periodoId, seccionId },
    });
    return count > 0;
  }
}
