import { AsignarAlumnoUseCase } from './asignar-alumno.use-case';
import { ApoderadoRepository } from '../../domain/repositories/apoderado.repository';
import { AlumnoRepository } from '@modules/alumnos/domain/repositories/alumno.repository';
import { Apoderado } from '../../domain/entities/apoderado.entity';
import { Alumno } from '@modules/alumnos/domain/entities/alumno.entity';

function buildApoderado(): Apoderado {
  return Apoderado.reconstitute({
    id: 'apo-1', personaId: 'persona-1', dni: '12345678',
    nombres: 'Rosa', apellidos: 'López', telefono: null,
    usuarioId: null, createdAt: new Date(), updatedAt: new Date(),
  });
}

function buildAlumno(colegioId = 'colegio-1'): Alumno {
  return Alumno.reconstitute({
    id: 'alumno-1', personaId: 'persona-2', colegioId,
    dni: '87654321', nombres: 'Luis', apellidos: 'García',
    fechaNac: new Date('2012-01-01'), genero: 'MASCULINO',
    telefono: null, direccion: null, codigoMatricula: '2026-001',
    estado: 'ACTIVO', colegioOrigenRef: null, createdAt: new Date(), updatedAt: new Date(),
  });
}

const mockApoderadoRepo: jest.Mocked<ApoderadoRepository> = {
  crear:                     jest.fn(),
  crearConPersona:           jest.fn(),
  buscarPorId:               jest.fn(),
  buscarPorDni:              jest.fn(),
  buscarPorPersonaId:        jest.fn(),
  listarPorAlumno:           jest.fn(),
  listarPorColegio:          jest.fn(),
  asignarAlumno:             jest.fn(),
  desvincularAlumno:         jest.fn(),
  contarVinculosPorAlumno:   jest.fn(),
  existeVinculo:             jest.fn(),
  existeParentescoPorAlumno: jest.fn(),
};

const mockAlumnoRepo: jest.Mocked<AlumnoRepository> = {
  crear:            jest.fn(),
  buscarPorId:      jest.fn(),
  buscarPorDni:     jest.fn(),
  listarPorColegio: jest.fn(),
  actualizar:       jest.fn(),
  cambiarEstado:    jest.fn(),
};

describe('AsignarAlumnoUseCase', () => {
  let useCase: AsignarAlumnoUseCase;
  const dto = { apoderadoId: 'apo-1', alumnoId: 'alumno-1', parentesco: 'MADRE' as const };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new AsignarAlumnoUseCase(mockApoderadoRepo, mockAlumnoRepo);
  });

  it('asigna correctamente el alumno al apoderado', async () => {
    mockApoderadoRepo.buscarPorId.mockResolvedValue(buildApoderado());
    mockAlumnoRepo.buscarPorId.mockResolvedValue(buildAlumno());
    mockApoderadoRepo.existeVinculo.mockResolvedValue(false);
    mockApoderadoRepo.contarVinculosPorAlumno.mockResolvedValue(0);
    mockApoderadoRepo.existeParentescoPorAlumno.mockResolvedValue(false);
    mockApoderadoRepo.asignarAlumno.mockResolvedValue({ alumnoId: 'alumno-1', parentesco: 'MADRE' });

    const result = await useCase.execute('colegio-1', dto);

    expect(result.ok).toBe(true);
    expect(mockApoderadoRepo.asignarAlumno).toHaveBeenCalledWith('apo-1', 'alumno-1', 'MADRE');
  });

  it('falla con NOT_FOUND cuando el apoderado no existe', async () => {
    mockApoderadoRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', dto);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('falla con NOT_FOUND cuando el alumno pertenece a otro colegio', async () => {
    mockApoderadoRepo.buscarPorId.mockResolvedValue(buildApoderado());
    mockAlumnoRepo.buscarPorId.mockResolvedValue(buildAlumno('colegio-2'));

    const result = await useCase.execute('colegio-1', dto);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('falla con CONFLICT cuando ya está vinculado', async () => {
    mockApoderadoRepo.buscarPorId.mockResolvedValue(buildApoderado());
    mockAlumnoRepo.buscarPorId.mockResolvedValue(buildAlumno());
    mockApoderadoRepo.existeVinculo.mockResolvedValue(true);

    const result = await useCase.execute('colegio-1', dto);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('falla con CONFLICT cuando el alumno ya tiene 2 apoderados', async () => {
    mockApoderadoRepo.buscarPorId.mockResolvedValue(buildApoderado());
    mockAlumnoRepo.buscarPorId.mockResolvedValue(buildAlumno());
    mockApoderadoRepo.existeVinculo.mockResolvedValue(false);
    mockApoderadoRepo.contarVinculosPorAlumno.mockResolvedValue(2);

    const result = await useCase.execute('colegio-1', dto);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('falla con CONFLICT cuando el parentesco ya está asignado', async () => {
    mockApoderadoRepo.buscarPorId.mockResolvedValue(buildApoderado());
    mockAlumnoRepo.buscarPorId.mockResolvedValue(buildAlumno());
    mockApoderadoRepo.existeVinculo.mockResolvedValue(false);
    mockApoderadoRepo.contarVinculosPorAlumno.mockResolvedValue(1);
    mockApoderadoRepo.existeParentescoPorAlumno.mockResolvedValue(true);

    const result = await useCase.execute('colegio-1', dto);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });
});
