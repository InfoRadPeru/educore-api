// Qué es: Representa el contexto activo de un usuario en un colegio/sede con un rol.
// Por qué entidad separada: UsuarioAsignacion tiene identidad propia y comportamiento
// (tienePermiso). Single Responsibility — no mezclar con Usuario.
// Por qué permisos como string[]: Los permisos son strings libres configurados por
// el SUPER_ADMIN del colegio. No hay enum. Abierto a extensión sin recompilar.

export interface AsignacionProps {
  id:            string;
  usuarioId:     string;
  colegioId:     string;
  colegioNombre: string;
  sedeId:        string | null;
  sedeNombre:    string | null;
  rolId:         string;
  rolNombre:     string;
  esSistema:     boolean;
  permisos:      string[];
  activo:        boolean;
}

export class Asignacion {
  private constructor(private readonly props: AsignacionProps) {}

  static reconstitute(props: AsignacionProps): Asignacion {
    return new Asignacion(props);
  }

  get id():            string        { return this.props.id; }
  get usuarioId():     string        { return this.props.usuarioId; }
  get colegioId():     string        { return this.props.colegioId; }
  get colegioNombre(): string        { return this.props.colegioNombre; }
  get sedeId():        string | null { return this.props.sedeId; }
  get sedeNombre():    string | null { return this.props.sedeNombre; }
  get rolId():         string        { return this.props.rolId; }
  get rolNombre():     string        { return this.props.rolNombre; }
  get esSistema():     boolean       { return this.props.esSistema; }
  get permisos():      string[]      { return this.props.permisos; }
  get activo():        boolean       { return this.props.activo; }

  // Comportamiento de dominio: sabe si tiene un permiso específico.
  // esSistema = true significa acceso total al colegio (SUPER_ADMIN).
  tienePermiso(permiso: string): boolean {
    if (this.props.esSistema) return true;
    return this.props.permisos.includes(permiso);
  }
}