import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  ASIGNATURA_MAESTRA_REPOSITORY,
  type AsignaturaMaestraRepository,
} from '../../domain/repositories/asignatura-maestra.repository';
import { AsignaturaMaestra } from '../../domain/entities/asignatura.entity';

export interface ActualizarAsignaturaMaestraDto {
  nombre?:       string;
  descripcion?:  string | null;
}

@Injectable()
export class ActualizarAsignaturaMaestraUseCase {
  constructor(
    @Inject(ASIGNATURA_MAESTRA_REPOSITORY)
    private readonly repo: AsignaturaMaestraRepository,
  ) {}

  async execute(
    id: string,
    dto: ActualizarAsignaturaMaestraDto,
  ): Promise<Result<AsignaturaMaestra, NotFoundError | ConflictError>> {
    const asignatura = await this.repo.buscarPorId(id);
    if (!asignatura) return fail(new NotFoundError('AsignaturaMaestra', id));

    if (dto.nombre && dto.nombre !== asignatura.nombre) {
      const conflicto = await this.repo.buscarPorNombre(dto.nombre);
      if (conflicto) return fail(new ConflictError(`Ya existe una asignatura con el nombre "${dto.nombre}"`));
    }

    const actualizada = await this.repo.actualizar(id, dto);
    return ok(actualizada);
  }
}
