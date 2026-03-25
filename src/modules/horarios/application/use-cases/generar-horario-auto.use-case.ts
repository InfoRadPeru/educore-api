import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import {
  HORARIO_REPOSITORY,
  type HorarioRepository,
} from '../../domain/repositories/horario.repository';
import { GeneradorHorarioService } from '../generador-horario.service';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface GenerarHorarioAutoResult {
  seccionId:        string;
  horarioId:        string;
  bloquesCreados:   number;
  horasNoColocadas: number;
}

@Injectable()
export class GenerarHorarioAutoUseCase {
  constructor(
    @Inject(HORARIO_REPOSITORY)
    private readonly repo: HorarioRepository,
    private readonly generador: GeneradorHorarioService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    seccionId: string,
    añoAcademico: number,
    colegioId: string,
    sobreescribir = false,
  ): Promise<Result<GenerarHorarioAutoResult, NotFoundError>> {
    // Verificar que la sección pertenece al colegio
    const seccion = await this.prisma.seccion.findFirst({
      where: { id: seccionId, colegioGrado: { colegioNivel: { colegioId } } },
    });
    if (!seccion) return fail(new NotFoundError('Seccion', seccionId));

    // Gestionar horario existente
    let horario = await this.repo.buscarHorarioPorSeccion(seccionId, añoAcademico);
    if (horario) {
      if (!sobreescribir) {
        return fail(new NotFoundError('HorarioSeccion ya existe — usar sobreescribir=true', seccionId));
      }
      // Limpiar bloques existentes si es borrador
      if (horario.esBorrador()) {
        await this.repo.eliminarBloquesPorHorario(horario.id);
      } else {
        // Si está publicado, crear nuevo en borrador (no tocar el publicado)
        horario = await this.repo.crearHorario(seccionId + '_draft', añoAcademico, true);
      }
    } else {
      horario = await this.repo.crearHorario(seccionId, añoAcademico, true);
    }

    // Generar bloques con el algoritmo
    const [resultado] = await this.generador.generarParaSecciones(
      [seccionId],
      añoAcademico,
      colegioId,
    );

    // Insertar bloques con el horarioSeccionId correcto
    const bloquesConId = resultado.bloques.map(b => ({
      ...b,
      horarioSeccionId: horario!.id,
    }));

    await this.repo.agregarBloques(bloquesConId);

    return ok({
      seccionId,
      horarioId:        horario.id,
      bloquesCreados:   bloquesConId.length,
      horasNoColocadas: resultado.horasNoColocadas,
    });
  }
}
