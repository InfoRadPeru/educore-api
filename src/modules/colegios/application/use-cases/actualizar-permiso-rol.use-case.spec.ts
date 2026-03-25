import { ActualizarPermisosRolUseCase } from './actualizar-permiso-rol.use-case';
import { RolRepository } from '@modules/colegios/domain/repositories/rol.repository';
import { Rol } from '@modules/colegios/domain/entities/rol.entity';

function buildRol(overrides: Partial<{ colegioId: string; esSistema: boolean; permisos: string[] }> = {}): Rol {
  return Rol.reconstitute({
    id:          'rol-1',
    colegioId:   overrides.colegioId ?? 'colegio-1',
    nombre:      'Docente',
    descripcion: null,
    esSistema:   overrides.esSistema ?? false,
    permisos:    overrides.permisos  ?? ['ver:notas'],
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

describe('ActualizarPermisosRolUseCase', () => {
  let useCase: ActualizarPermisosRolUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ActualizarPermisosRolUseCase(mockRepo);
  });

  it('reemplaza todos los permisos del rol', async () => {
    // ARRANGE — rol tiene ['ver:notas'], lo reemplazamos por ['ver:asistencia', 'editar:notas']
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ permisos: ['ver:notas'] }));
    const nuevosPermisos = ['ver:asistencia', 'editar:notas'];
    mockRepo.actualizar.mockResolvedValue(buildRol({ permisos: nuevosPermisos }));

    // ACT
    const result = await useCase.execute('colegio-1', 'rol-1', { permisos: nuevosPermisos });

    // ASSERT — la lista vieja ya no existe, solo la nueva
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(nuevosPermisos);
      expect(result.value).not.toContain('ver:notas');
    }
    expect(mockRepo.actualizar).toHaveBeenCalledWith('rol-1', { permisos: nuevosPermisos });
  });

  it('puede limpiar todos los permisos pasando lista vacía', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildRol());
    mockRepo.actualizar.mockResolvedValue(buildRol({ permisos: [] }));

    const result = await useCase.execute('colegio-1', 'rol-1', { permisos: [] });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toHaveLength(0);
  });

  it('falla con FORBIDDEN cuando el rol es de sistema', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildRol({ esSistema: true }));

    const result = await useCase.execute('colegio-1', 'rol-1', { permisos: ['ver:notas'] });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
  });
});
