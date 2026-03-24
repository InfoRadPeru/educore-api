import { EliminarPermisoRolUseCase } from './eliminar-permiso-rol.use-case';
import { RolRepository } from '@modules/colegios/domain/repositories/rol.repository';
import { Rol } from '@modules/colegios/domain/entities/rol.entity';

function buildRol(overrides: Partial<{ colegioId: string; esSistema: boolean; permisos: string[] }> = {}): Rol {
  return Rol.reconstitute({
    id:          'rol-1',
    colegioId:   overrides.colegioId ?? 'colegio-1',
    nombre:      'Docente',
    descripcion: null,
    esSistema:   overrides.esSistema ?? false,
    permisos:    overrides.permisos  ?? ['ver:notas', 'editar:notas'],
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

describe('EliminarPermisoRolUseCase', () => {
  let useCase: EliminarPermisoRolUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new EliminarPermisoRolUseCase(mockRepo);
  });

  it('quita el permiso indicado y retorna la lista restante', async () => {
    // ARRANGE — el rol tiene dos permisos, eliminamos uno
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ permisos: ['ver:notas', 'editar:notas'] }));
    mockRepo.actualizar.mockResolvedValue(buildRol({ permisos: ['editar:notas'] }));

    // ACT
    const result = await useCase.execute('colegio-1', 'rol-1', 'ver:notas');

    // ASSERT
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain('ver:notas');
      expect(result.value).toContain('editar:notas');
    }
    expect(mockRepo.actualizar).toHaveBeenCalledWith('rol-1', { permisos: ['editar:notas'] });
  });

  it('no falla si el permiso a eliminar no existía (idempotente)', async () => {
    // ARRANGE — el permiso 'crear:cursos' no está en el rol
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ permisos: ['ver:notas'] }));
    mockRepo.actualizar.mockResolvedValue(buildRol({ permisos: ['ver:notas'] }));

    // ACT — intentamos eliminar un permiso que no existe
    const result = await useCase.execute('colegio-1', 'rol-1', 'crear:cursos');

    // ASSERT — operación exitosa, la lista queda igual
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual(['ver:notas']);
  });

  it('falla con NOT_FOUND cuando el rol no existe', async () => {
    mockRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', 'rol-inexistente', 'ver:notas');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('falla con FORBIDDEN cuando el rol es de sistema', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ esSistema: true }));

    const result = await useCase.execute('colegio-1', 'rol-1', 'ver:notas');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
    expect(mockRepo.actualizar).not.toHaveBeenCalled();
  });
});
