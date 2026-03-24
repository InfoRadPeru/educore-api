export type EstadoPago  = 'REGISTRADO' | 'ANULADO';
export type MetodoPago  = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'DEPOSITO';

export interface PagoProps {
  id:              string;
  cuotaId:         string;
  colegioId:       string;
  alumnoId:        string;
  registradoPorId: string;
  monto:           number;
  metodoPago:      MetodoPago;
  referencia:      string | null;
  observacion:     string | null;
  estado:          EstadoPago;
  motivoAnulacion: string | null;
  createdAt:       Date;
  updatedAt:       Date;
}

export class Pago {
  private constructor(private readonly props: PagoProps) {}
  static reconstitute(props: PagoProps): Pago { return new Pago(props); }
  get id():              string     { return this.props.id; }
  get cuotaId():         string     { return this.props.cuotaId; }
  get colegioId():       string     { return this.props.colegioId; }
  get alumnoId():        string     { return this.props.alumnoId; }
  get registradoPorId(): string     { return this.props.registradoPorId; }
  get monto():           number     { return this.props.monto; }
  get metodoPago():      MetodoPago { return this.props.metodoPago; }
  get referencia():      string|null{ return this.props.referencia; }
  get observacion():     string|null{ return this.props.observacion; }
  get estado():          EstadoPago { return this.props.estado; }
  get motivoAnulacion(): string|null{ return this.props.motivoAnulacion; }
  get createdAt():       Date       { return this.props.createdAt; }
  get updatedAt():       Date       { return this.props.updatedAt; }
  estaRegistrado(): boolean { return this.props.estado === 'REGISTRADO'; }
}
