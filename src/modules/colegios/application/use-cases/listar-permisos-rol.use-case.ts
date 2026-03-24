import { ROL_REPOSITORY, type RolRepository } from "@modules/colegios/domain/repositories/rol.repository";
import { Inject, Injectable } from "@nestjs/common";
import { ok, fail, Result, NotFoundError } from "@shared/domain/result";

@Injectable()
export class ListarPermisosRolUseCase {
    constructor(
        @Inject(ROL_REPOSITORY)
        private readonly rolRepository: RolRepository
    ) {}

    async execute(colegioId: string, rolId: string): Promise<Result<string[]>> {
        const rol = await this.rolRepository.buscarPorId(rolId);
        if (!rol || rol.colegioId !== colegioId) return fail(new NotFoundError('Rol', rolId));
        return ok(rol.permisos);
    }
}
