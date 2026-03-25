import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import {
  HORARIO_REPOSITORY,
  type HorarioRepository,
} from '../../domain/repositories/horario.repository';
import { GeneradorHorarioService } from '../generador-horario.service';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface GenerarColegioResult {
  total:     number;
  resultados: { seccionId: string; seccionNombre: string; bloquesCreados: number; horasNoColocadas: number }[];
}

@Injectable()
export class GenerarHorarioColegioUseCase {
  constructor(
    @Inject(HORARIO_REPOSITORY)
    private readonly repo: HorarioRepository,
    private readonly generador: GeneradorHorarioService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    colegioId: string,
    añoAcademico: number,
    sobreescribir = false,
  ): Promise<Result<GenerarColegioResult>> {
    // Obtener todas las secciones del colegio con asignaciones para ese año
    const secciones = await this.prisma.seccion.findMany({
      where: {
        colegioGrado: { colegioNivel: { colegioId } },
        docenteAsignaciones: { some: { añoAcademico } },
      },
      orderBy: [
        { colegioGrado: { colegioNivel: { nivelMaestro: { orden: 'asc' } } } },
        { nombre: 'asc' },
      ],
    });

    const seccionIds = secciones.map(s => s.id);

    // Para cada sección: gestionar horario existente
    for (const seccion of secciones) {
      const existente = await this.repo.buscarHorarioPorSeccion(seccion.id, añoAcademico);
      if (existente) {
        if (!sobreescribir) continue; // saltar si no se quiere sobreescribir
        if (existente.esBorrador()) {
          await this.repo.eliminarBloquesPorHorario(existente.id);
        }
        // Si está publicado, no tocar
      } else {
        await this.repo.crearHorario(seccion.id, añoAcademico, true);
      }
    }

    // Generar todos en lote (el generador comparte tracker de conflictos)
    const resultados = await this.generador.generarParaSecciones(seccionIds, añoAcademico, colegioId);

    // Guardar bloques
    const respuesta: GenerarColegioResult['resultados'] = [];
    for (let i = 0; i < secciones.length; i++) {
      const seccion  = secciones[i];
      const resultado = resultados.find(r => r.seccionId === seccion.id);
      if (!resultado) continue;

      const horario = await this.repo.buscarHorarioPorSeccion(seccion.id, añoAcademico);
      if (!horario) continue;

      const bloquesConId = resultado.bloques.map(b => ({
        ...b,
        horarioSeccionId: horario.id,
      }));
      await this.repo.agregarBloques(bloquesConId);

      respuesta.push({
        seccionId:        seccion.id,
        seccionNombre:    seccion.nombre,
        bloquesCreados:   bloquesConId.length,
        horasNoColocadas: resultado.horasNoColocadas,
      });
    }

    return ok({ total: respuesta.length, resultados: respuesta });
  }
}
