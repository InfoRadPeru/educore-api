import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  NotaPeriodoRepository,
  UpsertNotaPeriodoProps,
} from '../../domain/repositories/nota-periodo.repository';
import { NotaPeriodo } from '../../domain/entities/nota-periodo.entity';
import { AcademicoMapper } from './academico.mapper';

@Injectable()
export class PrismaNotaPeriodoRepository implements NotaPeriodoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(props: UpsertNotaPeriodoProps): Promise<NotaPeriodo> {
    const raw = await this.prisma.notaPeriodo.upsert({
      where:  {
        alumnoId_docenteAsignacionId_periodoId: {
          alumnoId:            props.alumnoId,
          docenteAsignacionId: props.docenteAsignacionId,
          periodoId:           props.periodoId,
        },
      },
      create: props,
      update: {
        notaFinal:      props.notaFinal,
        esManual:       props.esManual,
        calculadaEn:    props.calculadaEn,
        calculadaPorId: props.calculadaPorId,
      },
    });
    return AcademicoMapper.notaPeriodoToDomain(raw);
  }

  async buscarPorAlumnoAsignacionPeriodo(
    alumnoId:            string,
    docenteAsignacionId: string,
    periodoId:           string,
  ): Promise<NotaPeriodo | null> {
    const raw = await this.prisma.notaPeriodo.findUnique({
      where: {
        alumnoId_docenteAsignacionId_periodoId: { alumnoId, docenteAsignacionId, periodoId },
      },
    });
    return raw ? AcademicoMapper.notaPeriodoToDomain(raw) : null;
  }

  async listarPorAlumnoYAsignacion(alumnoId: string, docenteAsignacionId: string): Promise<NotaPeriodo[]> {
    const rows = await this.prisma.notaPeriodo.findMany({
      where:   { alumnoId, docenteAsignacionId },
      orderBy: { periodo: { numero: 'asc' } },
    });
    return rows.map(AcademicoMapper.notaPeriodoToDomain);
  }
}
