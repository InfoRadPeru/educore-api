import { Inject, Injectable } from '@nestjs/common';
import {
  CATEGORIA_EVALUACION_REPOSITORY,
  type CategoriaEvaluacionRepository,
} from '../domain/repositories/categoria-evaluacion.repository';
import {
  NOTA_ACTIVIDAD_REPOSITORY,
  type NotaActividadRepository,
} from '../domain/repositories/nota-actividad.repository';
import {
  NOTA_PERIODO_REPOSITORY,
  type NotaPeriodoRepository,
} from '../domain/repositories/nota-periodo.repository';

@Injectable()
export class NotaCalculadoraService {
  constructor(
    @Inject(CATEGORIA_EVALUACION_REPOSITORY)
    private readonly categoriaRepo: CategoriaEvaluacionRepository,
    @Inject(NOTA_ACTIVIDAD_REPOSITORY)
    private readonly notaRepo: NotaActividadRepository,
    @Inject(NOTA_PERIODO_REPOSITORY)
    private readonly notaPeriodoRepo: NotaPeriodoRepository,
  ) {}

  async recalcular(
    docenteAsignacionId: string,
    periodoId:           string,
    alumnoId:            string,
    usuarioId:           string,
    notaMaxima:          number,
    decimales:           number,
  ): Promise<void> {
    // No sobreescribir nota manual
    const existente = await this.notaPeriodoRepo.buscarPorAlumnoAsignacionPeriodo(
      alumnoId, docenteAsignacionId, periodoId,
    );
    if (existente?.esManual) return;

    const categorias = await this.categoriaRepo.listarPorAsignacion(docenteAsignacionId, true);
    if (categorias.length === 0) return;

    const registros = await this.notaRepo.listarPorAlumnoYPeriodo(alumnoId, docenteAsignacionId, periodoId);

    // Agrupar notas calificadas por categoría
    const scoresPorCategoria = new Map<string, number>();

    for (const cat of categorias) {
      const notasDeCat = registros.filter(
        r => r.categoriaId === cat.id && r.nota.puntaje !== null,
      );
      if (notasDeCat.length === 0) continue;

      // Promedio ponderado dentro de la categoría (pesos relativos)
      const sumaPesos = notasDeCat.reduce((acc, r) => acc + r.actividad.pesoEnCategoria, 0);
      const sumaScore = notasDeCat.reduce(
        (acc, r) => acc + (r.nota.puntaje! / r.actividad.puntajeMaximo) * r.actividad.pesoEnCategoria,
        0,
      );
      scoresPorCategoria.set(cat.id, (sumaScore / sumaPesos) * notaMaxima);
    }

    if (scoresPorCategoria.size === 0) return;

    // Renormalizar pesos de categorías que tienen score
    const sumaCategoriasConScore = categorias
      .filter(c => scoresPorCategoria.has(c.id))
      .reduce((acc, c) => acc + c.peso, 0);

    let notaFinal = 0;
    for (const cat of categorias) {
      const score = scoresPorCategoria.get(cat.id);
      if (score === undefined) continue;
      notaFinal += score * (cat.peso / sumaCategoriasConScore);
    }

    // Redondear según configuración del colegio
    const factor = Math.pow(10, decimales);
    notaFinal = Math.round(notaFinal * factor) / factor;

    await this.notaPeriodoRepo.upsert({
      alumnoId,
      docenteAsignacionId,
      periodoId,
      notaFinal,
      esManual:       false,
      calculadaEn:    new Date(),
      calculadaPorId: usuarioId,
    });
  }
}
