import { Rol } from "../entities/rol.entity";


export const ROL_REPOSITORY = 'RolRepository';

export interface CrearRolProps {
    colegioId: string;
    nombre: string;
    descripcion: string | null;
    esSistema: boolean;
    permisos: string[];
}

export interface ActualizarRolProps {
    nombre?: string;
    descripcion?: string | null;
    permisos?: string[];
}

export interface RolRepository {
    crear(props: CrearRolProps): Promise<Rol>;
    listarRolesPorColegio(colegioId: string): Promise<Rol[]>;
    buscarPorId(id: string): Promise<Rol | null>;
    eliminar(id: string): Promise<void>;
    actualizar(id: string, props: ActualizarRolProps): Promise<Rol>;
}