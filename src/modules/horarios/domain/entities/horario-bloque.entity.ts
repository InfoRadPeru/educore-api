export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';

export interface HorarioBloqueProps {
  id:                  string;
  horarioSeccionId:    string;
  docenteAsignacionId: string;
  franjaHorariaId:     string;
  diaSemana:           DiaSemana;
  aula:                string | null;
  createdAt:           Date;
  updatedAt:           Date;
}

export class HorarioBloque {
  private constructor(private readonly props: HorarioBloqueProps) {}

  static reconstitute(props: HorarioBloqueProps): HorarioBloque {
    return new HorarioBloque(props);
  }

  get id():                  string    { return this.props.id; }
  get horarioSeccionId():    string    { return this.props.horarioSeccionId; }
  get docenteAsignacionId(): string    { return this.props.docenteAsignacionId; }
  get franjaHorariaId():     string    { return this.props.franjaHorariaId; }
  get diaSemana():           DiaSemana { return this.props.diaSemana; }
  get aula():                string | null { return this.props.aula; }
  get createdAt():           Date      { return this.props.createdAt; }
  get updatedAt():           Date      { return this.props.updatedAt; }
}
