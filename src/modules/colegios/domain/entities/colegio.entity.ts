// Qué es: Entidad de dominio Colegio.
// Patrón: Rich Domain Model — la entidad tiene comportamiento, no solo datos.
// Principio SOLID: Single Responsibility — solo conoce las reglas de negocio de un Colegio.
// Por qué factory method: Constructor privado. Solo se crea via Colegio.reconstitute().
// Así nunca existe un Colegio en estado inválido en memoria.

export type EstadoColegio = 'ACTIVO' | 'SUSPENDIDO' | 'INACTIVO';
export type PlanColegio   = 'BASICO' | 'PREMIUM' | 'ENTERPRISE';

export interface ColegioProps {
  id:          string;
  nombre:      string;
  ruc:         string;
  direccion:   string;
  telefono:    string | null;
  email:       string;
  estado:      EstadoColegio;
  plan:        PlanColegio;
  planVenceEn: Date | null;
  createdAt:   Date;
  updatedAt:   Date;
}

export class Colegio {
  private constructor(private readonly props: ColegioProps) {}

  static reconstitute(props: ColegioProps): Colegio {
    return new Colegio(props);
  }

  get id():          string           { return this.props.id; }
  get nombre():      string           { return this.props.nombre; }
  get ruc():         string           { return this.props.ruc; }
  get direccion():   string           { return this.props.direccion; }
  get telefono():    string | null    { return this.props.telefono; }
  get email():       string           { return this.props.email; }
  get estado():      EstadoColegio    { return this.props.estado; }
  get plan():        PlanColegio      { return this.props.plan; }
  get planVenceEn(): Date | null      { return this.props.planVenceEn; }
  get createdAt():   Date             { return this.props.createdAt; }
  get updatedAt():   Date             { return this.props.updatedAt; }

  estaActivo():     boolean { return this.props.estado === 'ACTIVO'; }
  estaSuspendido(): boolean { return this.props.estado === 'SUSPENDIDO'; }

  // Límites según plan — Single source of truth para reglas de negocio
  limitesSedes(): number {
    const limites: Record<PlanColegio, number> = {
      BASICO:     1,
      PREMIUM:    2,
      ENTERPRISE: 10,
    };
    return limites[this.props.plan];
  }

  limitesSeccionesPorGrado(): number | null {
    const limites: Record<PlanColegio, number | null> = {
      BASICO:     1,
      PREMIUM:    3,
      ENTERPRISE: null, // ilimitado
    };
    return limites[this.props.plan];
  }

  planSugerido(): PlanColegio | null {
    const siguiente: Record<PlanColegio, PlanColegio | null> = {
      BASICO:     'PREMIUM',
      PREMIUM:    'ENTERPRISE',
      ENTERPRISE: null,
    };
    return siguiente[this.props.plan];
  }
}