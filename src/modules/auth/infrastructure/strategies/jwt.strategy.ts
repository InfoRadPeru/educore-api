// Qué es: Estrategia Passport que valida el JWT en cada request protegida.
// Patrón: Strategy Pattern. Passport permite intercambiar estrategias de autenticación sin tocar el resto del código.
// Por qué: Separa la lógica de validación del token de los controllers. Cada request protegida pasa por aquí automáticamente.

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export interface JwtPayload {
  sub:              string;
  email:            string;
  // Contexto de colegio — ausente solo en PLATFORM_ADMIN
  colegioId?:       string;
  sedeId?:          string | null;
  rolId?:           string;
  esSistema?:       boolean;
  permisos?:        string[];
  // Solo en PLATFORM_ADMIN
  esPlatformAdmin?: boolean;
  // Solo en tempToken de select-context
  tipo?:            string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest:   ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:      config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}