export type EstadoHorario = 'BORRADOR' | 'PUBLICADO';

export interface HorarioSeccionProps {
  id:           string;
  seccionId:    string;
  añoAcademico: number;
  estado:       EstadoHorario;
  generadoAuto: boolean;
  createdAt:    Date;
  updatedAt:    Date;
}

export class HorarioSeccion {
  private constructor(private readonly props: HorarioSeccionProps) {}

  static reconstitute(props: HorarioSeccionProps): HorarioSeccion {
    return new HorarioSeccion(props);
  }

  get id():           string        { return this.props.id; }
  get seccionId():    string        { return this.props.seccionId; }
  get añoAcademico(): number        { return this.props.añoAcademico; }
  get estado():       EstadoHorario { return this.props.estado; }
  get generadoAuto(): boolean       { return this.props.generadoAuto; }
  get createdAt():    Date          { return this.props.createdAt; }
  get updatedAt():    Date          { return this.props.updatedAt; }

  esBorrador():    boolean { return this.props.estado === 'BORRADOR'; }
  estaPublicado(): boolean { return this.props.estado === 'PUBLICADO'; }
}
