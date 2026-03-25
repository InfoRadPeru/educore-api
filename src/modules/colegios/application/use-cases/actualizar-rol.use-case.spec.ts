import { ActualizarRolUseCase } from './actualizar-rol.use-case';
import { RolRepository } from '@modules/colegios/domain/repositories/rol.repository';
import { Rol } from '@modules/colegios/domain/entities/rol.entity';

function buildRol(overrides: Partial<{ colegioId: string; nombre: string; esSistema: boolean }> = {}): Rol {
  return Rol.reconstitute({
    id:          'rol-1',
    colegioId:   overrides.colegioId ?? 'colegio-1',
    nombre:      overrides.nombre    ?? 'Docente',
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

describe('ActualizarRolUseCase', () => {
  let useCase: ActualizarRolUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ActualizarRolUseCase(mockRepo);
  });

  it('actualiza y retorna el rol modificado', async () => {
    // ARRANGE
    mockRepo.buscarPorId.mockResolvedValue(buildRol());
    const rolActualizado = buildRol({ nombre: 'Tutor' });
    mockRepo.actualizar.mockResolvedValue(rolActualizado);

    // ACT
    const result = await useCase.execute('colegio-1', 'rol-1', { nombre: 'Tutor' });

    // ASSERT
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.nombre).toBe('Tutor');
    expect(mockRepo.actualizar).toHaveBeenCalledWith('rol-1', { nombre: 'Tutor', descripcion: undefined });
  });

  it('falla con NOT_FOUND cuando el rol no existe', async () => {
    mockRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', 'rol-inexistente', { nombre: 'X' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
    expect(mockRepo.actualizar).not.toHaveBeenCalled();
  });

  it('falla con NOT_FOUND cuando el rol pertenece a otro colegio', async () => {
    // ARRANGE — el rol existe pero para 'colegio-2', no 'colegio-1'
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ colegioId: 'colegio-2' }));

    const result = await useCase.execute('colegio-1', 'rol-1', { nombre: 'X' });

    // NOT_FOUND y no FORBIDDEN para no revelar que el rol existe en otro colegio
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('falla con FORBIDDEN cuando el rol es de sistema', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ esSistema: true }));

    const result = await useCase.execute('colegio-1', 'rol-1', { nombre: 'X' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
    expect(mockRepo.actualizar).not.toHaveBeenCalled();
  });
});
