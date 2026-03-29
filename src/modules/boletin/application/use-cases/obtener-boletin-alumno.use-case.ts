import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ForbiddenError, ValidationError } from '@shared/domain/result';
import { BoletinQueryService } from '../boletin-query.service';
import { BoletinResponseDto } from '../dtos/boletin.dto';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

@Injectable()
export class ObtenerBoletinAlumnoUseCase {
  constructor(
    private readonly query: BoletinQueryService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    alumnoId: string,
    año: number,
    colegioId: string,
  ): Promise<Result<BoletinResponseDto, NotFoundError | ForbiddenError | ValidationError>> {
    if (!año || isNaN(año)) return fail(new ValidationError('El parámetro año es requerido'));
    // Verificar que el alumno pertenece al colegio
    const perfil = await this.prisma.perfilAlumno.findFirst({
      where: { id: alumnoId, colegioId },
      select: { id: true },
    });

    if (!perfil) {
      return fail(new NotFoundError('Alumno', alumnoId));
    }

    const boletin = await this.query.obtenerBoletin(alumnoId, año, false);
    if (!boletin) {
      return fail(new NotFoundError('Boletín', alumnoId));
    }

    return ok(boletin);
  }
}
