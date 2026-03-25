export interface NotaPeriodoProps {
  id:                  string;
  alumnoId:            string;
  docenteAsignacionId: string;
  periodoId:           string;
  notaFinal:           number;
  esManual:            boolean;
  calculadaEn:         Date;
  calculadaPorId:      string;
}

export class NotaPeriodo {
  private constructor(private readonly props: NotaPeriodoProps) {}

  static reconstitute(props: NotaPeriodoProps): NotaPeriodo {
    return new NotaPeriodo(props);
  }

  get id():                  string  { return this.props.id; }
  get alumnoId():            string  { return this.props.alumnoId; }
  get docenteAsignacionId(): string  { return this.props.docenteAsignacionId; }
  get periodoId():           string  { return this.props.periodoId; }
  get notaFinal():           number  { return this.props.notaFinal; }
  get esManual():            boolean { return this.props.esManual; }
  get calculadaEn():         Date    { return this.props.calculadaEn; }
  get calculadaPorId():      string  { return this.props.calculadaPorId; }
}
