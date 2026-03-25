import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { TESORERIA_REPOSITORY, type TesoreriaRepository, type CrearCuotaProps } from '../../domain/repositories/tesoreria.repository';
import { CuotaAlumno } from '../../domain/entities/cuota-alumno.entity';

export interface GenerarCuotasAlumnoProps {
  alumnoId:       string;
  colegioId:      string;
  colegioNivelId: string;
  añoAcademico:   number;
  mesesPension?:  number[];
  diaVencimiento?: number;
}

@Injectable()
export class GenerarCuotasAlumnoUseCase {
  constructor(@Inject(TESORERIA_REPOSITORY) private readonly repo: TesoreriaRepository) {}

  async execute(props: GenerarCuotasAlumnoProps): Promise<Result<CuotaAlumno[]>> {
    const { alumnoId, colegioId, colegioNivelId, añoAcademico } = props;
    const meses         = props.mesesPension  ?? [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const diaVencimiento = props.diaVencimiento ?? 15;

    // Obtener conceptos activos del colegio
    const conceptos = await this.repo.listarConceptos(colegioId);
    const activos   = conceptos.filter(c => c.activo);
    if (!activos.length) return ok([]);

    const cuotasACrear: CrearCuotaProps[] = [];

    for (const concepto of activos) {
      // Tarifa: buscar por nivel primero, luego sin nivel (colegio-wide)
      let tarifa = await this.repo.buscarTarifa(concepto.id, añoAcademico, colegioNivelId);
      if (!tarifa) tarifa = await this.repo.buscarTarifa(concepto.id, añoAcademico);
      if (!tarifa) continue; // sin tarifa configurada → omitir

      if (concepto.tipo === 'MATRICULA') {
        // Cuota única de matrícula — mes null
        cuotasACrear.push({
          alumnoId,
          conceptoPagoId:   concepto.id,
          añoAcademico,
          mes:              null as number | null,
          descripcion:      `Matrícula ${añoAcademico}`,
          monto:            tarifa.monto,
          fechaVencimiento: new Date(añoAcademico, 1, diaVencimiento), // feb
        });
      } else {
        // PENSION u OTRO → una cuota por mes
        for (const mes of meses) {
          cuotasACrear.push({
            alumnoId,
            conceptoPagoId:   concepto.id,
            añoAcademico,
            mes,
            descripcion:      `${concepto.nombre} — mes ${mes} / ${añoAcademico}`,
            monto:            tarifa.monto,
            fechaVencimiento: new Date(añoAcademico, mes - 1, diaVencimiento),
          });
        }
      }
    }

    const creadas = await this.repo.crearCuotas(cuotasACrear);
    return ok(creadas);
  }
}
