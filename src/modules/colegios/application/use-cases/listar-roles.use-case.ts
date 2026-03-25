import { ROL_REPOSITORY, type RolRepository } from "@modules/colegios/domain/repositories/rol.repository";
import { RolResponseDto } from "../dtos/rol-response.dto";
import { Inject, Injectable } from "@nestjs/common";
import { ok, Result } from "@shared/domain/result";

@Injectable()
export class ListarRolesUseCase {
    constructor(
        @Inject(ROL_REPOSITORY)
        private readonly rolRepository: RolRepository
    ) {}

    async execute(colegioId: string): Promise<Result<RolResponseDto[]>> {
        const roles = await this.rolRepository.listarRolesPorColegio(colegioId);
        return ok(roles.map(r => ({
            id:          r.id,
            colegioId:   r.colegioId,
            nombre:      r.nombre,
            descripcion: r.descripcion,
            esSistema:   r.esSistema,
            permisos:    r.permisos,
            createdAt:   r.createdAt,
            updatedAt:   r.updatedAt,
        })));
    }
}
