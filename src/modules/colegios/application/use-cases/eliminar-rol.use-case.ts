import { ROL_REPOSITORY, type RolRepository } from "@modules/colegios/domain/repositories/rol.repository";
import { Inject, Injectable } from "@nestjs/common";
import { ok, fail, Result, NotFoundError, ForbiddenError } from "@shared/domain/result";

@Injectable()
export class EliminarRolUseCase {
    constructor(
        @Inject(ROL_REPOSITORY)
        private readonly rolRepository: RolRepository
    ) {}

    async execute(colegioId: string, rolId: string): Promise<Result<void>> {
        const rol = await this.rolRepository.buscarPorId(rolId);
        if (!rol || rol.colegioId !== colegioId) return fail(new NotFoundError('Rol', rolId));
        if (rol.esSoloLectura()) return fail(new ForbiddenError('Los roles de sistema no pueden eliminarse'));

        await this.rolRepository.eliminar(rolId);
        return ok(undefined);
    }
}
