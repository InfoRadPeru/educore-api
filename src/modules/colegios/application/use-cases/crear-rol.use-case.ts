import { ROL_REPOSITORY, type RolRepository } from "@modules/colegios/domain/repositories/rol.repository";
import { CrearRolDto } from "../dtos/crear-rol.dto";
import { RolResponseDto } from "../dtos/rol-response.dto";
import { Inject, Injectable } from "@nestjs/common";
import { ok, fail, Result, ConflictError } from "@shared/domain/result";

@Injectable()
export class CrearRolUseCase {
    constructor(
        @Inject(ROL_REPOSITORY)
        private readonly rolRepository: RolRepository
    ) {}

    async execute(colegioId: string, dto: CrearRolDto): Promise<Result<RolResponseDto>> {
        const existentes = await this.rolRepository.listarRolesPorColegio(colegioId);
        const nombreDuplicado = existentes.some(r => r.nombre.toLowerCase() === dto.nombre.toLowerCase());
        if (nombreDuplicado) {
            return fail(new ConflictError(`Ya existe un rol con el nombre '${dto.nombre}'`));
        }

        const rol = await this.rolRepository.crear({
            colegioId,
            nombre:      dto.nombre,
            descripcion: dto.descripcion ?? null,
            esSistema:   false,
            permisos:    dto.permisos ?? [],
        });

        return ok(toDto(rol));
    }
}

function toDto(rol: { id: string; colegioId: string; nombre: string; descripcion: string | null; esSistema: boolean; permisos: string[]; createdAt: Date; updatedAt: Date }): RolResponseDto {
    return {
        id:          rol.id,
        colegioId:   rol.colegioId,
        nombre:      rol.nombre,
        descripcion: rol.descripcion,
        esSistema:   rol.esSistema,
        permisos:    rol.permisos,
        createdAt:   rol.createdAt,
        updatedAt:   rol.updatedAt,
    };
}
