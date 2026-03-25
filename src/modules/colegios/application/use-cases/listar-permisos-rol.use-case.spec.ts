import { ListarPermisosRolUseCase } from './listar-permisos-rol.use-case';
import { RolRepository } from '@modules/colegios/domain/repositories/rol.repository';
import { Rol } from '@modules/colegios/domain/entities/rol.entity';

function buildRol(overrides: Partial<{ colegioId: string; permisos: string[] }> = {}): Rol {
  return Rol.reconstitute({
    id:          'rol-1',
    colegioId:   overrides.colegioId ?? 'colegio-1',
    nombre:      'Docente',
    descripcion: null,
    esSistema:   false,
    permisos:    overrides.permisos  ?? ['ver:notas', 'ver:asistencia'],
    createdAt:   new Date('2026-01-01'),
    updatedAt:   new Date('2026-01-01'),
  });
}

const mockRepo: jest.Mocked<RolRepository> = {
  crear:                 jest.fn(),
  listarRolesPorColegio: jest.fn(),
  buscarPorId:           jest.fn(),
  eliminar:              jest.fn(),
  actualizar:            jest.fn(),
};

describe('ListarPermisosRolUseCase', () => {
  let useCase: ListarPermisosRolUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListarPermisosRolUseCase(mockRepo);
  });

  it('retorna los permisos del rol', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ permisos: ['ver:notas', 'ver:asistencia'] }));

    const result = await useCase.execute('colegio-1', 'rol-1');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual(['ver:notas', 'ver:asistencia']);
  });

  it('retorna lista vacía cuando el rol no tiene permisos', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ permisos: [] }));

    const result = await useCase.execute('colegio-1', 'rol-1');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toHaveLength(0);
  });

  it('falla con NOT_FOUND cuando el rol no existe', async () => {
    mockRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', 'rol-inexistente');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('falla con NOT_FOUND cuando el rol pertenece a otro colegio', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ colegioId: 'colegio-2' }));

    const result = await useCase.execute('colegio-1', 'rol-1');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});
