import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ForbiddenError, ValidationError } from '@shared/domain/result';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  COMUNICADO_REPOSITORY,
  type ComunicadoRepository,
} from '../../domain/repositories/comunicado.repository';
import { Comunicado } from '../../domain/entities/comunicado.entity';

@Injectable()
export class ListarComunicadosApoderadoUseCase {
  constructor(
    @Inject(COMUNICADO_REPOSITORY)
    private readonly repo: ComunicadoRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    usuarioId: string,
    año: number,
  ): Promise<Result<Comunicado[], ForbiddenError | ValidationError>> {
    if (!año || isNaN(año)) return fail(new ValidationError('El parámetro año es requerido'));
    // Resolver perfil de apoderado
    const apoderado = await this.prisma.perfilApoderado.findFirst({
      where: { persona: { usuario: { id: usuarioId } } },
      select: { id: true },
    });

    if (!apoderado) {
      return fail(new ForbiddenError('No tienes perfil de apoderado'));
    }

    // Obtener colegioId desde los alumnos vinculados (matrícula activa)
    const alumnoVinculo = await this.prisma.apoderadoAlumno.findFirst({
      where: { apoderadoId: apoderado.id },
      include: {
        alumno: { select: { colegioId: true } },
      },
    });

    if (!alumnoVinculo) {
      return ok([]);
    }

    const colegioId = alumnoVinculo.alumno.colegioId;
    const comunicados = await this.repo.listarParaApoderado(apoderado.id, colegioId, año);
    return ok(comunicados);
  }
}
