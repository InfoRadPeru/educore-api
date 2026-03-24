import { Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { DiaSemana } from '../../domain/entities/horario-bloque.entity';

export interface BloqueDocenteDto {
  bloqueId:        string;
  dia:             DiaSemana;
  franjaId:        string;
  franjaNombre:    string;
  horaInicio:      string;
  horaFin:         string;
  seccionId:       string;
  seccionNombre:   string;
  asignaturaNombre: string;
  aula:            string | null;
}

@Injectable()
export class ObtenerHorarioDocenteUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    docenteId: string,
    añoAcademico: number,
  ): Promise<Result<BloqueDocenteDto[]>> {
    const bloques = await this.prisma.horarioBloque.findMany({
      where: {
        docenteAsignacion: { docenteId, añoAcademico },
        horarioSeccion: { estado: 'PUBLICADO' },
      },
      include: {
        franjaHoraria: true,
        horarioSeccion: { include: { seccion: true } },
        docenteAsignacion: {
          include: {
            colegioAsignatura: { include: { asignaturaMaestra: true } },
          },
        },
      },
      orderBy: [
        { diaSemana: 'asc' },
        { franjaHoraria: { orden: 'asc' } },
      ],
    });

    const resultado: BloqueDocenteDto[] = bloques.map(b => ({
      bloqueId:         b.id,
      dia:              b.diaSemana as DiaSemana,
      franjaId:         b.franjaHorariaId,
      franjaNombre:     b.franjaHoraria.nombre,
      horaInicio:       b.franjaHoraria.horaInicio,
      horaFin:          b.franjaHoraria.horaFin,
      seccionId:        b.horarioSeccion.seccionId,
      seccionNombre:    b.horarioSeccion.seccion.nombre,
      asignaturaNombre: b.docenteAsignacion.colegioAsignatura.nombre
        ?? b.docenteAsignacion.colegioAsignatura.asignaturaMaestra.nombre,
      aula:             b.aula,
    }));

    return ok(resultado);
  }
}
