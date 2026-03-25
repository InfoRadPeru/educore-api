export interface RolProps {
    id: string;
    colegioId: string;
    nombre: string;
    descripcion: string | null;
    esSistema: boolean;
    permisos: string[];
    createdAt: Date;
    updatedAt: Date;
}

export class Rol {

    private constructor(
        private readonly props: RolProps
    ) {}

    static reconstitute(props: RolProps): Rol {
        return new Rol(props);
    }

    get id(): string { return this.props.id; }
    get colegioId(): string { return this.props.colegioId; }
    get nombre(): string { return this.props.nombre; }
    get descripcion(): string | null { return this.props.descripcion; }
    get esSistema(): boolean { return this.props.esSistema; }
    get permisos(): string[] { return [...this.props.permisos]; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }

    esSoloLectura(): boolean {
        return this.props.esSistema;
    }

    agregarPermiso(permiso: string): void {
        if (!this.props.permisos.includes(permiso)) { this.props.permisos.push(permiso); }
    }

    quitarPermiso(permiso: string): void {
        this.props.permisos = this.props.permisos.filter(p => p !== permiso);
    }

}