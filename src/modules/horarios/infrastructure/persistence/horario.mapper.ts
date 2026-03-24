import { FranjaHoraria } from '../../domain/entities/franja-horaria.entity';
import { HorarioSeccion, EstadoHorario } from '../../domain/entities/horario-seccion.entity';
import { HorarioBloque, DiaSemana } from '../../domain/entities/horario-bloque.entity';

type FranjaPrisma = {
  id: string; colegioId: string; nombre: string;
  horaInicio: string; horaFin: string; orden: number; activo: boolean;
  createdAt: Date; updatedAt: Date;
};

type HorarioSeccionPrisma = {
  id: string; seccionId: string; añoAcademico: number;
  estado: string; generadoAuto: boolean; createdAt: Date; updatedAt: Date;
};

type HorarioBloquePrisma = {
  id: string; horarioSeccionId: string; docenteAsignacionId: string;
  franjaHorariaId: string; diaSemana: string; aula: string | null;
  createdAt: Date; updatedAt: Date;
};

export class HorarioMapper {
  static franjaToEntity(raw: FranjaPrisma): FranjaHoraria {
    return FranjaHoraria.reconstitute({
      id:         raw.id,
      colegioId:  raw.colegioId,
      nombre:     raw.nombre,
      horaInicio: raw.horaInicio,
      horaFin:    raw.horaFin,
      orden:      raw.orden,
      activo:     raw.activo,
      createdAt:  raw.createdAt,
      updatedAt:  raw.updatedAt,
    });
  }

  static horarioToEntity(raw: HorarioSeccionPrisma): HorarioSeccion {
    return HorarioSeccion.reconstitute({
      id:           raw.id,
      seccionId:    raw.seccionId,
      añoAcademico: raw.añoAcademico,
      estado:       raw.estado as EstadoHorario,
      generadoAuto: raw.generadoAuto,
      createdAt:    raw.createdAt,
      updatedAt:    raw.updatedAt,
    });
  }

  static bloqueToEntity(raw: HorarioBloquePrisma): HorarioBloque {
    return HorarioBloque.reconstitute({
      id:                  raw.id,
      horarioSeccionId:    raw.horarioSeccionId,
      docenteAsignacionId: raw.docenteAsignacionId,
      franjaHorariaId:     raw.franjaHorariaId,
      diaSemana:           raw.diaSemana as DiaSemana,
      aula:                raw.aula,
      createdAt:           raw.createdAt,
      updatedAt:           raw.updatedAt,
    });
  }
}
