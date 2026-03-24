import { CrearRolUseCase } from './crear-rol.use-case';
import { RolRepository } from '@modules/colegios/domain/repositories/rol.repository';
import { Rol } from '@modules/colegios/domain/entities/rol.entity';

// ─── Helper ───────────────────────────────────────────────────────────────────
// buildRol construye una entidad Rol válida para usar en los mocks.
// Pasar overrides permite personalizar solo lo que importa para cada test.
function buildRol(overrides: Partial<{ id: string; colegioId: string; nombre: string; esSistema: boolean; permisos: string[] }> = {}): Rol {
  return Rol.reconstitute({
    id:          overrides.id          ?? 'rol-1',
    colegioId:   overrides.colegioId   ?? 'colegio-1',
    nombre:      overrides.nombre      ?? 'Docente',
    descripcion: null,
    esSistema:   overrides.esSistema   ?? false,
    permisos:    overrides.permisos    ?? [],
    createdAt:   new Date('2026-01-01'),
    updatedAt:   new Date('2026-01-01'),
  });
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
const mockRepo: jest.Mocked<RolRepository> = {
  crear:                    jest.fn(),
  listarRolesPorColegio:    jest.fn(),
  buscarPorId:              jest.fn(),
  eliminar:                 jest.fn(),
  actualizar:               jest.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('CrearRolUseCase', () => {
  let useCase: CrearRolUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CrearRolUseCase(mockRepo);
  });

  it('crea el rol y retorna el DTO cuando el nombre no existe', async () => {
    // ARRANGE — no hay roles existentes en el colegio
    mockRepo.listarRolesPorColegio.mockResolvedValue([]);
    const rolCreado = buildRol({ nombre: 'Tutor' });
    mockRepo.crear.mockResolvedValue(rolCreado);

    // ACT
    const result = await useCase.execute('colegio-1', { nombre: 'Tutor' });

    // ASSERT
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.nombre).toBe('Tutor');
      expect(result.value.esSistema).toBe(false);
    }
    expect(mockRepo.crear).toHaveBeenCalledWith(expect.objectContaining({
      colegioId: 'colegio-1',
      nombre:    'Tutor',
      esSistema: false,
    }));
  });

  it('falla con CONFLICT cuando ya existe un rol con ese nombre en el colegio', async () => {
    // ARRANGE — ya existe un rol llamado 'Docente'
    mockRepo.listarRolesPorColegio.mockResolvedValue([buildRol({ nombre: 'Docente' })]);

    // ACT
    const result = await useCase.execute('colegio-1', { nombre: 'Docente' });

    // ASSERT
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(mockRepo.crear).not.toHaveBeenCalled();
  });

  it('la comparación de nombre duplicado es case-insensitive', async () => {
    mockRepo.listarRolesPorColegio.mockResolvedValue([buildRol({ nombre: 'docente' })]);

    const result = await useCase.execute('colegio-1', { nombre: 'DOCENTE' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('asigna permisos vacíos por defecto si no se pasan', async () => {
    mockRepo.listarRolesPorColegio.mockResolvedValue([]);
    mockRepo.crear.mockResolvedValue(buildRol({ permisos: [] }));

    await useCase.execute('colegio-1', { nombre: 'Auxiliar' });

    expect(mockRepo.crear).toHaveBeenCalledWith(expect.objectContaining({ permisos: [] }));
  });
});
