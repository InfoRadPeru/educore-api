// Qué es: Caso de uso — crea una sede validando el límite del plan.
// Aquí vive la regla de negocio del límite — no en el repositorio ni en el controller.
// Principio SOLID: Single Responsibility — orquesta validación de plan + creación.

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { PlanLimitError } from '../../domain/errors/plan-limit.error';
import { CrearSedeDto } from '../dtos/crear-sede.dto';
import { SedeResponseDto } from '../dtos/sede-response.dto';

@Injectable()
export class CrearSedeUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string, dto: CrearSedeDto): Promise<Result<SedeResponseDto>> {
    const colegio = await this.colegioRepository.findById(colegioId);
    if (!colegio) return fail({ code: 'NOT_FOUND', message: 'Colegio no encontrado' } as any);

    const sedesActivas = await this.colegioRepository.contarSedesActivas(colegioId);
    const limite = colegio.limitesSedes();

    if (sedesActivas >= limite) {
      return fail(new PlanLimitError(limite, sedesActivas, 'sedes', colegio.planSugerido()));
    }

    const sede = await this.colegioRepository.crearSede({ colegioId, ...dto });

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