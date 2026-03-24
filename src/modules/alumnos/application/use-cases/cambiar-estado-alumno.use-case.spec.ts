import { CambiarEstadoAlumnoUseCase } from './cambiar-estado-alumno.use-case';
import { AlumnoRepository } from '../../domain/repositories/alumno.repository';
import { Alumno } from '../../domain/entities/alumno.entity';

function buildAlumno(overrides: Partial<{ colegioId: string; estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO' }> = {}): Alumno {
  return Alumno.reconstitute({
    id: 'alumno-1', personaId: 'persona-1',
    colegioId: overrides.colegioId ?? 'colegio-1',
    dni: '12345678', nombres: 'Juan', apellidos: 'Pérez',
    fechaNac: new Date('2010-05-15'), genero: 'MASCULINO',
    telefono: null, direccion: null, codigoMatricula: '2026-ABC',
    estado: overrides.estado ?? 'ACTIVO',
    colegioOrigenRef: null, createdAt: new Date(), updatedAt: new Date(),
  });
}

const mockRepo: jest.Mocked<AlumnoRepository> = {
  crear: jest.fn(), buscarPorId: jest.fn(), buscarPorDni: jest.fn(),
  listarPorColegio: jest.fn(), actualizar: jest.fn(), cambiarEstado: jest.fn(),
};

describe('CambiarEstadoAlumnoUseCase', () => {
  let useCase: CambiarEstadoAlumnoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CambiarEstadoAlumnoUseCase(mockRepo);
  });

  it('cambia el estado y retorna el alumno actualizado', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildAlumno({ estado: 'ACTIVO' }));
    mockRepo.cambiarEstado.mockResolvedValue(buildAlumno({ estado: 'INACTIVO' }));

    const result = await useCase.execute('colegio-1', 'alumno-1', { estado: 'INACTIVO' });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.estado).toBe('INACTIVO');
    expect(mockRepo.cambiarEstado).toHaveBeenCalledWith('alumno-1', 'INACTIVO');
  });

  it('falla con CONFLICT cuando el alumno ya tiene ese estado', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildAlumno({ estado: 'RETIRADO' }));

    const result = await useCase.execute('colegio-1', 'alumno-1', { estado: 'RETIRADO' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(mockRepo.cambiarEstado).not.toHaveBeenCalled();
  });

  it('falla con NOT_FOUND cuando el alumno no existe', async () => {
    mockRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', 'inexistente', { estado: 'INACTIVO' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('falla con NOT_FOUND cuando el alumno pertenece a otro colegio', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildAlumno({ colegioId: 'colegio-2' }));

    const result = await useCase.execute('colegio-1', 'alumno-1', { estado: 'INACTIVO' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});
