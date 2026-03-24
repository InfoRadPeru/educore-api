import { Rol } from "@modules/colegios/domain/entities/rol.entity";
import { ActualizarRolProps, CrearRolProps, RolRepository } from "@modules/colegios/domain/repositories/rol.repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { RolMapper } from "./rol.mapper";

const INCLUDE_PERMISO = {
    permisos: {
        select: {
            permiso: true
        }
    }
} as const;

@Injectable()
export class PrismaRolRepository implements RolRepository {

    constructor(
        private readonly prisma: PrismaService
    ) {}

    async crear(props: CrearRolProps): Promise<Rol> {
        const raw = await this.prisma.colegioRol.create({
            data: {
                colegioId:   props.colegioId,
                nombre:      props.nombre,
                descripcion: props.descripcion,
                esSistema:   props.esSistema,
                permisos: {
                    create: props.permisos.map(p => ({ permiso: p }))
                }
            },
            include: INCLUDE_PERMISO,
        });
        return RolMapper.toDomain(raw);
    }

    async listarRolesPorColegio(colegioId: string): Promise<Rol[]> {
        const raw = await this.prisma.colegioRol.findMany({
            where: { colegioId },
            include: INCLUDE_PERMISO,
        });
        return raw.map(r => RolMapper.toDomain(r));
    }

    async buscarPorId(id: string): Promise<Rol|null> {
        const raw = await this.prisma.colegioRol.findUnique({
            where:   { id },
            include: INCLUDE_PERMISO,
        });
        return raw? RolMapper.toDomain(raw): null;
    }

    async eliminar(id: string): Promise<void> {
        await this.prisma.colegioRol.delete({ where: { id } });
    }

    async actualizar(id: string, props: ActualizarRolProps): Promise<Rol> {
        const { permisos, ...camposRol } = props;
        const raw = await this.prisma.colegioRol.update({
            where: { id },
            data: {
                ...camposRol,
                permisos: permisos !== undefined ? {
                    deleteMany: {},
                    create: permisos.map(p => ({ permiso: p }))
                } : undefined
            },
            include: INCLUDE_PERMISO,
        });
        return RolMapper.toDomain(raw);
    }

}