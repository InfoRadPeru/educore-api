// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Caso de uso — crea una sede validando el límite de plan.
//
// QUÉ CAMBIÓ:
//   1. Ahora usa dos repositorios: ColegioRepository (para leer el
//      plan y límites) y SedeRepository (para crear y contar sedes).
//      Cada repositorio tiene una sola responsabilidad.
//
//   2. Corregido el fake error object:
//      Antes: fail({ code: 'NOT_FOUND', ... } as any)  → respondía 500
//      Ahora: fail(new NotFoundError(...))              → responde 404
//
// REGLA DE NEGOCIO:
//   La validación del límite vive en el use case, no en el repositorio.
//   El repositorio solo sabe persistir — no conoce reglas de negocio.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { SEDE_REPOSITORY, type SedeRepository } from '../../domain/repositories/sede.repository';
import { PlanLimitError } from '../../domain/errors/plan-limit.error';
import { CrearSedeDto } from '../dtos/crear-sede.dto';
import { SedeResponseDto } from '../dtos/sede-response.dto';

@Injectable()
export class CrearSedeUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,

    @Inject(SEDE_REPOSITORY)
    private readonly sedeRepository: SedeRepository,
  ) {}

  async execute(colegioId: string, dto: CrearSedeDto): Promise<Result<SedeResponseDto>> {
    // Necesitamos el colegio para leer los límites del plan
    const colegio = await this.colegioRepository.buscarPorId(colegioId);
    if (!colegio) return fail(new NotFoundError('Colegio', colegioId));

    const sedesActivas = await this.sedeRepository.contarActivas(colegioId);
    const limite       = colegio.limitesSedes();

    if (sedesActivas >= limite) {
      return fail(new PlanLimitError(limite, sedesActivas, 'sedes', colegio.planSugerido()));
    }

    const sede = await this.sedeRepository.crear({ colegioId, ...dto });

    return ok({
      id:        sede.id,
      colegioId: sede.colegioId,
      nombre:    sede.nombre,
      direccion: sede.direccion,
      telefono:  sede.telefono,
      email:     sede.email,
      activo:    sede.activo,
      createdAt: sede.createdAt,
      updatedAt: sede.updatedAt,
    });
  }
}