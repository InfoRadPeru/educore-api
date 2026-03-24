import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ForbiddenError } from '@shared/domain/result';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  COMUNICADO_REPOSITORY,
  type ComunicadoRepository,
} from '../../domain/repositories/comunicado.repository';
import { ComunicadoLectura } from '../../domain/entities/comunicado-lectura.entity';

@Injectable()
export class MarcarComunicadoLeidoUseCase {
  constructor(
    @Inject(COMUNICADO_REPOSITORY)
    private readonly repo: ComunicadoRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    usuarioId: string,
    comunicadoId: string,
  ): Promise<Result<ComunicadoLectura, NotFoundError | ForbiddenError>> {
    // Resolver perfil de apoderado
    const apoderado = await this.prisma.perfilApoderado.findFirst({
      where: { persona: { usuario: { id: usuarioId } } },
      select: { id: true },
    });

    if (!apoderado) {
      return fail(new ForbiddenError('No tienes perfil de apoderado'));
    }

    // Verificar que el comunicado existe
    const comunicado = await this.repo.buscarPorId(comunicadoId);
    if (!comunicado || !comunicado.estaPublicado()) {
      return fail(new NotFoundError('Comunicado', comunicadoId));
    }

    // Idempotente: si ya lo leyó, devolver la lectura existente
    const lecturaExistente = await this.repo.buscarLectura(comunicadoId, apoderado.id);
    if (lecturaExistente) {
      return ok(lecturaExistente);
    }

    const lectura = await this.repo.marcarLeido(comunicadoId, apoderado.id);
    return ok(lectura);
  }
}
