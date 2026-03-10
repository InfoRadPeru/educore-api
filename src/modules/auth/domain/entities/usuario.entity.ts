// Qué es: Entidad de dominio Usuario.
// Patrón: Rich Domain Model.
// Cambio vs versión anterior: Usuario ya no tiene rol. Sus roles son por
// UsuarioAsignacion (uno por colegio/sede). Single Responsibility — Usuario
// solo conoce su estado de cuenta, no su rol en ningún colegio.

import { Email }          from '../value-objects/email.vo';
import { EstadoUsuario }  from '../enums/estado-usuario.enum';

export interface UsuarioProps {
  id:               string;
  email:            Email;
  passwordHash:     string;
  nombres:          string;
  apellidos:        string;
  telefono:         string | null;
  avatarUrl:        string | null;
  estado:           EstadoUsuario;
  intentosFallidos: number;
  bloqueadoHasta:   Date | null;
  ultimoAcceso:     Date | null;
  esPlatformAdmin:  boolean;
  createdAt:         Date;
}

const MAX_INTENTOS_FALLIDOS = 5;
const MINUTOS_BLOQUEO       = 15;

export class Usuario {
  private constructor(private readonly props: UsuarioProps) {}

  static reconstitute(props: UsuarioProps): Usuario {
    return new Usuario(props);
  }

  get id():               string        { return this.props.id; }
  get email():            Email         { return this.props.email; }
  get passwordHash():     string        { return this.props.passwordHash; }
  get nombres():          string        { return this.props.nombres; }
  get apellidos():        string        { return this.props.apellidos; }
  get telefono():         string | null { return this.props.telefono; }
  get avatarUrl():        string | null { return this.props.avatarUrl; }
  get estado():           EstadoUsuario { return this.props.estado; }
  get intentosFallidos(): number        { return this.props.intentosFallidos; }
  get bloqueadoHasta():   Date | null   { return this.props.bloqueadoHasta; }
  get ultimoAcceso():     Date | null   { return this.props.ultimoAcceso; }
  get esPlatformAdmin():  boolean       { return this.props.esPlatformAdmin; }
  get createdAt():         Date          { return this.props.createdAt; }

  estaActivo(): boolean {
    return this.props.estado === EstadoUsuario.ACTIVO;
  }

  estaBloqueado(): boolean {
    if (!this.props.bloqueadoHasta) return false;
    return new Date() < this.props.bloqueadoHasta;
  }

  static get MAX_INTENTOS_FALLIDOS(): number { return MAX_INTENTOS_FALLIDOS; }
  static get MINUTOS_BLOQUEO():       number { return MINUTOS_BLOQUEO; }
}