export interface ComunicadoLecturaProps {
  id:           string;
  comunicadoId: string;
  apoderadoId:  string;
  leidoEn:      Date;
}

export class ComunicadoLectura {
  private constructor(private readonly props: ComunicadoLecturaProps) {}

  static reconstitute(props: ComunicadoLecturaProps): ComunicadoLectura {
    return new ComunicadoLectura(props);
  }

  get id():           string { return this.props.id; }
  get comunicadoId(): string { return this.props.comunicadoId; }
  get apoderadoId():  string { return this.props.apoderadoId; }
  get leidoEn():      Date   { return this.props.leidoEn; }
}
