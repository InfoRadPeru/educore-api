import { ROL_REPOSITORY, type RolRepository } from "@modules/colegios/domain/repositories/rol.repository";
import { ActualizarRolDto } from "../dtos/actualizar-rol.dto";
import { RolResponseDto } from "../dtos/rol-response.dto";
import { Inject, Injectable } from "@nestjs/common";
import { ok, fail, Result, NotFoundError, ForbiddenError } from "@shared/domain/result";

@Injectable()
export class ActualizarRolUseCase {
    constructor(
        @Inject(ROL_REPOSITORY)
        private readonly rolRepository: RolRepository
    ) {}

    async execute(colegioId: string, rolId: string, dto: ActualizarRolDto): Promise<Result<RolResponseDto>> {
        const rol = await this.rolRepository.buscarPorId(rolId);
        if (!rol || rol.colegioId !== colegioId) return fail(new NotFoundError('Rol', rolId));
        if (rol.esSoloLectura()) return fail(new ForbiddenError('Los roles de sistema no pueden modificarse'));

        const actualizado = await this.rolRepository.actualizar(rolId, {
            nombre:      dto.nombre,
            descripcion: dto.descripcion,
        });

        return ok({
            id:          actualizado.id,
            colegioId:   actualizado.colegioId,
            nombre:      actualizado.nombre,
            descripcion: actualizado.descripcion,
            esSistema:   actualizado.esSistema,
            permisos:    actualizado.permisos,
            createdAt:   actualizado.createdAt,
            updatedAt:   actualizado.updatedAt,
        });
    }
}
