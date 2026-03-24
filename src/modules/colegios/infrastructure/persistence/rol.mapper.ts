import { Rol } from "@modules/colegios/domain/entities/rol.entity";

type RolPrisma = {
    id: string;
    colegioId: string;
    nombre: string;
    descripcion: string | null;
    esSistema: boolean;
    permisos: {
        permiso: string;
    } []
    createdAt: Date;
    updatedAt: Date;
}

export class RolMapper {
    static toDomain(raw: RolPrisma): Rol {
        return Rol.reconstitute({
            id: raw.id,
            colegioId: raw.colegioId,
            nombre: raw.nombre,
            descripcion: raw.descripcion,
            esSistema: raw.esSistema,
            permisos: raw.permisos.map(p => p.permiso),
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        });
    }
}