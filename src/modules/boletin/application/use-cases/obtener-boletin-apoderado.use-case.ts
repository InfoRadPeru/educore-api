import { Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ForbiddenError } from '@shared/domain/result';
import { BoletinQueryService } from '../boletin-query.service';
import { BoletinResponseDto } from '../dtos/boletin.dto';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

@Injectable()
export class ObtenerBoletinApoderadoUseCase {
  constructor(
    private readonly query: BoletinQueryService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    apoderadoUserId: string,
    alumnoId: string,
    año: number,
  ): Promise<Result<BoletinResponseDto, NotFoundError | ForbiddenError>> {
    // Buscar el perfil de apoderado vinculado al usuario
    const apoderado = await this.prisma.perfilApoderado.findFirst({
      where: { persona: { usuario: { id: apoderadoUserId } } },
      select: { id: true },
    });

    if (!apoderado) {
      return fail(new ForbiddenError('No tienes perfil de apoderado'));
    }

    // Verificar que el alumno está vinculado a este apoderado
    const vinculo = await this.prisma.apoderadoAlumno.findFirst({
      where: { apoderadoId: apoderado.id, alumnoId },
      select: { id: true },
    });

    if (!vinculo) {
      return fail(new ForbiddenError('No tienes acceso al boletín de este alumno'));
    }

    // Obtener boletín con solo periodos publicados
    const boletin = await this.query.obtenerBoletin(alumnoId, año, true);
    if (!boletin) {
      return fail(new NotFoundError('Boletín', alumnoId));
    }

    return ok(boletin);
  }
}
