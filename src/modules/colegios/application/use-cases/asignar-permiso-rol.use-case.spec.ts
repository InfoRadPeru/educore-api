import { AsignarPermisoRolUseCase } from './asignar-permiso-rol.use-case';
import { RolRepository } from '@modules/colegios/domain/repositories/rol.repository';
import { Rol } from '@modules/colegios/domain/entities/rol.entity';

function buildRol(overrides: Partial<{ colegioId: string; esSistema: boolean; permisos: string[] }> = {}): Rol {
  return Rol.reconstitute({
    id:          'rol-1',
    colegioId:   overrides.colegioId ?? 'colegio-1',
    nombre:      'Docente',
    descripcion: null,
    esSistema:   overrides.esSistema ?? false,
    permisos:    overrides.permisos  ?? [],
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

describe('AsignarPermisoRolUseCase', () => {
  let useCase: AsignarPermisoRolUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new AsignarPermisoRolUseCase(mockRepo);
  });

  it('agrega el permiso y retorna la lista actualizada', async () => {
    // ARRANGE — el rol empieza sin permisos
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ permisos: [] }));
    mockRepo.actualizar.mockResolvedValue(buildRol({ permisos: ['ver:notas'] }));

    // ACT
    const result = await useCase.execute('colegio-1', 'rol-1', { permiso: 'ver:notas' });

    // ASSERT
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toContain('ver:notas');

    // Verifica que se llamó actualizar con los permisos correctos
    expect(mockRepo.actualizar).toHaveBeenCalledWith('rol-1', { permisos: ['ver:notas'] });
  });

  it('no duplica el permiso si ya existía (idempotente)', async () => {
    // ARRANGE — el permiso ya existe en el rol
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ permisos: ['ver:notas'] }));
    mockRepo.actualizar.mockResolvedValue(buildRol({ permisos: ['ver:notas'] }));

    const result = await useCase.execute('colegio-1', 'rol-1', { permiso: 'ver:notas' });

    expect(result.ok).toBe(true);
    // La lista que se pasa a actualizar no debe tener duplicados
    expect(mockRepo.actualizar).toHaveBeenCalledWith('rol-1', { permisos: ['ver:notas'] });
  });

  it('falla con NOT_FOUND cuando el rol no existe', async () => {
    mockRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', 'rol-inexistente', { permiso: 'ver:notas' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
    expect(mockRepo.actualizar).not.toHaveBeenCalled();
  });

  it('falla con FORBIDDEN cuando el rol es de sistema', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ esSistema: true }));

    const result = await useCase.execute('colegio-1', 'rol-1', { permiso: 'ver:notas' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
  });
});
