export interface PublicacionBoletinProps {
  id:            string;
  periodoId:     string;
  seccionId:     string;
  publicadoEn:   Date;
  publicadoPorId: string;
}

export class PublicacionBoletin {
  private constructor(private readonly props: PublicacionBoletinProps) {}

  static reconstitute(props: PublicacionBoletinProps): PublicacionBoletin {
    return new PublicacionBoletin(props);
  }

  get id():             string { return this.props.id; }
  get periodoId():      string { return this.props.periodoId; }
  get seccionId():      string { return this.props.seccionId; }
  get publicadoEn():    Date   { return this.props.publicadoEn; }
  get publicadoPorId(): string { return this.props.publicadoPorId; }
}
