import { PeriodoEvaluacion } from '../../domain/entities/periodo-evaluacion.entity';
import { CategoriaEvaluacion } from '../../domain/entities/categoria-evaluacion.entity';
import { Actividad } from '../../domain/entities/actividad.entity';
import { NotaActividad } from '../../domain/entities/nota-actividad.entity';
import { NotaPeriodo } from '../../domain/entities/nota-periodo.entity';
import { Asistencia, type EstadoAsistencia } from '../../domain/entities/asistencia.entity';

export type PeriodoPrisma = {
  id: string; colegioId: string; añoAcademico: number; nombre: string;
  numero: number; fechaInicio: Date; fechaFin: Date; activo: boolean;
  createdAt: Date; updatedAt: Date;
};

export type CategoriaPrisma = {
  id: string; docenteAsignacionId: string; nombre: string;
  peso: number; orden: number; activo: boolean; createdAt: Date; updatedAt: Date;
};

export type ActividadPrisma = {
  id: string; docenteAsignacionId: string; periodoId: string; categoriaId: string;
  titulo: string; descripcion: string | null; fechaLimite: Date | null;
  puntajeMaximo: number; pesoEnCategoria: number; activo: boolean;
  createdAt: Date; updatedAt: Date;
};

export type NotaActividadPrisma = {
  id: string; actividadId: string; alumnoId: string;
  puntaje: number | null; observacion: string | null;
  calificadoPorId: string; createdAt: Date; updatedAt: Date;
};

export type NotaPeriodoPrisma = {
  id: string; alumnoId: string; docenteAsignacionId: string; periodoId: string;
  notaFinal: number; esManual: boolean; calculadaEn: Date; calculadaPorId: string;
};

export type AsistenciaPrisma = {
  id: string; docenteAsignacionId: string; alumnoId: string;
  fecha: Date; estado: string; observacion: string | null;
  registradoPorId: string; createdAt: Date; updatedAt: Date;
};

export class AcademicoMapper {
  static periodoToDomain(raw: PeriodoPrisma): PeriodoEvaluacion {
    return PeriodoEvaluacion.reconstitute({ ...raw });
  }

  static categoriaToDomain(raw: CategoriaPrisma): CategoriaEvaluacion {
    return CategoriaEvaluacion.reconstitute({ ...raw });
  }

  static actividadToDomain(raw: ActividadPrisma): Actividad {
    return Actividad.reconstitute({ ...raw });
  }

  static notaActividadToDomain(raw: NotaActividadPrisma): NotaActividad {
    return NotaActividad.reconstitute({ ...raw });
  }

  static notaPeriodoToDomain(raw: NotaPeriodoPrisma): NotaPeriodo {
    return NotaPeriodo.reconstitute({ ...raw });
  }

  static asistenciaToDomain(raw: AsistenciaPrisma): Asistencia {
    return Asistencia.reconstitute({
      ...raw,
      estado: raw.estado as EstadoAsistencia,
    });
  }
}
