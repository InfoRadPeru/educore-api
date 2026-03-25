export interface TarifaConceptoProps {
  id:             string;
  conceptoPagoId: string;
  añoAcademico:   number;
  colegioNivelId: string | null;
  monto:          number;
  createdAt:      Date;
  updatedAt:      Date;
}

export class TarifaConcepto {
  private constructor(private readonly props: TarifaConceptoProps) {}
  static reconstitute(props: TarifaConceptoProps): TarifaConcepto { return new TarifaConcepto(props); }
  get id():             string      { return this.props.id; }
  get conceptoPagoId(): string      { return this.props.conceptoPagoId; }
  get añoAcademico():   number      { return this.props.añoAcademico; }
  get colegioNivelId(): string|null { return this.props.colegioNivelId; }
  get monto():          number      { return this.props.monto; }
  get createdAt():      Date        { return this.props.createdAt; }
  get updatedAt():      Date        { return this.props.updatedAt; }
}
