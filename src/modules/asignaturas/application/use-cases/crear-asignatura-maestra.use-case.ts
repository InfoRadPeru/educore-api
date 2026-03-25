import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ConflictError } from '@shared/domain/result';
import {
  ASIGNATURA_MAESTRA_REPOSITORY,
  type AsignaturaMaestraRepository,
} from '../../domain/repositories/asignatura-maestra.repository';
import { AsignaturaMaestra } from '../../domain/entities/asignatura.entity';

export interface CrearAsignaturaMaestraDto {
  nombre:       string;
  descripcion?: string;
}

@Injectable()
export class CrearAsignaturaMaestraUseCase {
  constructor(
    @Inject(ASIGNATURA_MAESTRA_REPOSITORY)
    private readonly repo: AsignaturaMaestraRepository,
  ) {}

  async execute(dto: CrearAsignaturaMaestraDto): Promise<Result<AsignaturaMaestra, ConflictError>> {
    const existe = await this.repo.buscarPorNombre(dto.nombre);
    if (existe) return fail(new ConflictError(`Ya existe una asignatura con el nombre "${dto.nombre}"`));

    const asignatura = await this.repo.crear({ nombre: dto.nombre, descripcion: dto.descripcion });
    return ok(asignatura);
  }
}
