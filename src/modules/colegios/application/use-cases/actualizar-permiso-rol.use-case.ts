import { ROL_REPOSITORY, type RolRepository } from "@modules/colegios/domain/repositories/rol.repository";
import { ActualizarPermisosDto } from "../dtos/asignar-permiso.dto";
import { Inject, Injectable } from "@nestjs/common";
import { ok, fail, Result, NotFoundError, ForbiddenError } from "@shared/domain/result";

// Reemplaza la lista completa de permisos de un rol.
@Injectable()
export class ActualizarPermisosRolUseCase {
    constructor(
        @Inject(ROL_REPOSITORY)
        private readonly rolRepository: RolRepository
    ) {}

    async execute(colegioId: string, rolId: string, dto: ActualizarPermisosDto): Promise<Result<string[]>> {
        const rol = await this.rolRepository.buscarPorId(rolId);
        if (!rol || rol.colegioId !== colegioId) return fail(new NotFoundError('Rol', rolId));
        if (rol.esSoloLectura()) return fail(new ForbiddenError('Los roles de sistema no pueden modificarse'));

        const actualizado = await this.rolRepository.actualizar(rolId, { permisos: dto.permisos });
        return ok(actualizado.permisos);
    }
}
