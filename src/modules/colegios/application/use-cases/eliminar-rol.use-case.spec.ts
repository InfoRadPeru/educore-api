import { EliminarRolUseCase } from './eliminar-rol.use-case';
import { RolRepository } from '@modules/colegios/domain/repositories/rol.repository';
import { Rol } from '@modules/colegios/domain/entities/rol.entity';

function buildRol(overrides: Partial<{ colegioId: string; esSistema: boolean }> = {}): Rol {
  return Rol.reconstitute({
    id:          'rol-1',
    colegioId:   overrides.colegioId ?? 'colegio-1',
    nombre:      'Docente',
    descripcion: null,
    esSistema:   overrides.esSistema ?? false,
    permisos:    [],
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

describe('EliminarRolUseCase', () => {
  let useCase: EliminarRolUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new EliminarRolUseCase(mockRepo);
  });

  it('elimina el rol y retorna ok', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildRol());
    mockRepo.eliminar.mockResolvedValue();

    const result = await useCase.execute('colegio-1', 'rol-1');

    expect(result.ok).toBe(true);
    expect(mockRepo.eliminar).toHaveBeenCalledWith('rol-1');
  });

  it('falla con NOT_FOUND cuando el rol no existe', async () => {
    mockRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', 'rol-inexistente');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
    expect(mockRepo.eliminar).not.toHaveBeenCalled();
  });

  it('falla con NOT_FOUND cuando el rol pertenece a otro colegio', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ colegioId: 'colegio-2' }));

    const result = await useCase.execute('colegio-1', 'rol-1');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('falla con FORBIDDEN cuando el rol es de sistema', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ esSistema: true }));

    const result = await useCase.execute('colegio-1', 'rol-1');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
    expect(mockRepo.eliminar).not.toHaveBeenCalled();
  });
});
