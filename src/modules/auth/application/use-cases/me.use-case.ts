import { USUARIO_REPOSITORY, type UsuarioRepository } from "@modules/auth/domain/repositories/usuario.repository";
import { Inject, Injectable } from "@nestjs/common";
import { ok, Result, UnauthorizedError } from "@shared/domain/result";
import { ContextoActualDto, MeResponseDto } from "../dtos/me-response.dto";
import { ASIGNACION_REPOSITORY, type AsignacionRepository } from "@modules/auth/domain/repositories/asignacion.repository";

export interface MePayload {
  usuarioId:  string;
  colegioId?: string;
  sedeId?:    string | null;
  rolId?:     string;
}

@Injectable()
export class MeUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(ASIGNACION_REPOSITORY)
    private readonly asignacionRepository: AsignacionRepository,
  ) {}

  async execute(payload: MePayload): Promise<Result<MeResponseDto, UnauthorizedError>> {
    const usuario = await this.usuarioRepository.buscarPorId(payload.usuarioId);
    if (!usuario) return fail(new UnauthorizedError());

    let contextoActual: ContextoActualDto | null = null;

    if (payload.rolId && payload.colegioId) {
      // Busca la asignación que coincide con el contexto actual del JWT
      const asignaciones = await this.asignacionRepository.findByUsuario(usuario.id);
      const asignacion = asignaciones.find(
        a => a.rolId === payload.rolId && a.colegioId === payload.colegioId && a.activo,
      );

      if (asignacion) {
        contextoActual = {
          colegioId:     asignacion.colegioId,
          colegioNombre: asignacion.colegioNombre,
          sedeId:        asignacion.sedeId,
          sedeNombre:    asignacion.sedeNombre,
          rolNombre:     asignacion.rolNombre,
          esSistema:     asignacion.esSistema,
          permisos:      asignacion.permisos,
        };
      }
    }

    return ok({
      id:             usuario.id,
      email:          usuario.email.value,
      nombres:        usuario.nombres,
      apellidos:      usuario.apellidos,
      ultimoAcceso:   usuario.ultimoAcceso,
      contextoActual,
    });
  }
}