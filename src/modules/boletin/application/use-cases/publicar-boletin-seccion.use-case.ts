import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  PUBLICACION_BOLETIN_REPOSITORY,
  type PublicacionBoletinRepository,
} from '../../domain/repositories/publicacion-boletin.repository';
import { PublicacionBoletin } from '../../domain/entities/publicacion-boletin.entity';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PublicarBoletinSeccionUseCase {
  constructor(
    @Inject(PUBLICACION_BOLETIN_REPOSITORY)
    private readonly repo: PublicacionBoletinRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    periodoId: string,
    seccionId: string,
    publicadoPorId: string,
  ): Promise<Result<PublicacionBoletin, NotFoundError | ConflictError>> {
    const periodo = await this.prisma.periodoEvaluacion.findUnique({
      where: { id: periodoId },
      select: { id: true },
    });
    if (!periodo) return fail(new NotFoundError('Periodo', periodoId));

    const seccion = await this.prisma.seccion.findUnique({
      where: { id: seccionId },
      select: { id: true },
    });
    if (!seccion) return fail(new NotFoundError('Sección', seccionId));

    const existente = await this.repo.buscarPorPeriodoYSeccion(periodoId, seccionId);
    if (existente) {
      return fail(new ConflictError('El boletín ya está publicado para este periodo y sección'));
    }

    const publicacion = await this.repo.crear({ periodoId, seccionId, publicadoPorId });
    return ok(publicacion);
  }
}
