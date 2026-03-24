export type TipoConceptoPago = 'MATRICULA' | 'PENSION' | 'OTRO';

export interface ConceptoPagoProps {
  id:        string;
  colegioId: string;
  nombre:    string;
  tipo:      TipoConceptoPago;
  activo:    boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ConceptoPago {
  private constructor(private readonly props: ConceptoPagoProps) {}
  static reconstitute(props: ConceptoPagoProps): ConceptoPago { return new ConceptoPago(props); }
  get id():        string           { return this.props.id; }
  get colegioId(): string           { return this.props.colegioId; }
  get nombre():    string           { return this.props.nombre; }
  get tipo():      TipoConceptoPago { return this.props.tipo; }
  get activo():    boolean          { return this.props.activo; }
  get createdAt(): Date             { return this.props.createdAt; }
  get updatedAt(): Date             { return this.props.updatedAt; }
}
