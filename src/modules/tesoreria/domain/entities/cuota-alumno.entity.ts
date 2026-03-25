export type EstadoCuota = 'PENDIENTE' | 'PAGADA' | 'VENCIDA' | 'ANULADA';

export interface CuotaAlumnoProps {
  id:               string;
  alumnoId:         string;
  conceptoPagoId:   string;
  añoAcademico:     number;
  mes:              number | null;
  descripcion:      string;
  monto:            number;
  montoPagado:      number;
  fechaVencimiento: Date;
  estado:           EstadoCuota;
  createdAt:        Date;
  updatedAt:        Date;
}

export class CuotaAlumno {
  private constructor(private readonly props: CuotaAlumnoProps) {}
  static reconstitute(props: CuotaAlumnoProps): CuotaAlumno { return new CuotaAlumno(props); }
  get id():               string      { return this.props.id; }
  get alumnoId():         string      { return this.props.alumnoId; }
  get conceptoPagoId():   string      { return this.props.conceptoPagoId; }
  get añoAcademico():     number      { return this.props.añoAcademico; }
  get mes():              number|null { return this.props.mes; }
  get descripcion():      string      { return this.props.descripcion; }
  get monto():            number      { return this.props.monto; }
  get montoPagado():      number      { return this.props.montoPagado; }
  get fechaVencimiento(): Date        { return this.props.fechaVencimiento; }
  get estado():           EstadoCuota { return this.props.estado; }
  get createdAt():        Date        { return this.props.createdAt; }
  get updatedAt():        Date        { return this.props.updatedAt; }
  estaPendiente():  boolean { return this.props.estado === 'PENDIENTE'; }
  estaPagada():     boolean { return this.props.estado === 'PAGADA'; }
  get saldo():      number  { return this.props.monto - this.props.montoPagado; }
}
