import { ListarRolesUseCase } from './listar-roles.use-case';
import { RolRepository } from '@modules/colegios/domain/repositories/rol.repository';
import { Rol } from '@modules/colegios/domain/entities/rol.entity';

function buildRol(nombre: string, esSistema = false): Rol {
  return Rol.reconstitute({
    id: `rol-${nombre}`, colegioId: 'colegio-1', nombre, descripcion: null,
    esSistema, permisos: ['ver:reportes'], createdAt: new Date(), updatedAt: new Date(),
  });
}

const mockRepo: jest.Mocked<RolRepository> = {
  crear:                 jest.fn(),
  listarRolesPorColegio: jest.fn(),
  buscarPorId:           jest.fn(),
  eliminar:              jest.fn(),
  actualizar:            jest.fn(),
};

describe('ListarRolesUseCase', () => {
  let useCase: ListarRolesUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListarRolesUseCase(mockRepo);
  });

  it('retorna los roles del colegio mapeados a DTO', async () => {
    mockRepo.listarRolesPorColegio.mockResolvedValue([
      buildRol('SUPER_ADMIN', true),
      buildRol('Docente'),
    ]);

    const result = await useCase.execute('colegio-1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(2);
      expect(result.value[0].nombre).toBe('SUPER_ADMIN');
      expect(result.value[1].nombre).toBe('Docente');
      // Verifica que el DTO incluye permisos
      expect(result.value[0].permisos).toEqual(['ver:reportes']);
    }
    expect(mockRepo.listarRolesPorColegio).toHaveBeenCalledWith('colegio-1');
  });

  it('retorna lista vacía cuando el colegio no tiene roles', async () => {
    mockRepo.listarRolesPorColegio.mockResolvedValue([]);

    const result = await useCase.execute('colegio-1');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toHaveLength(0);
  });
});
