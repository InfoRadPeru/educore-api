import { ConfirmarPrematriculaUseCase } from './confirmar-prematricula.use-case';
import { PrematriculaRepository } from '../../domain/repositories/prematricula.repository';
import { AlumnoRepository } from '@modules/alumnos/domain/repositories/alumno.repository';
import { MatriculaRepository } from '@modules/matriculas/domain/repositories/matricula.repository';
import { Prematricula } from '../../domain/entities/prematricula.entity';
import { Alumno } from '@modules/alumnos/domain/entities/alumno.entity';
import { Matricula } from '@modules/matriculas/domain/entities/matricula.entity';

function buildPrematricula(overrides: Partial<{ colegioId: string; estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' }> = {}): Prematricula {
  return Prematricula.reconstitute({
    id: 'pre-1', colegioId: overrides.colegioId ?? 'colegio-1', alumnoId: 'alumno-1',
    colegioNivelId: 'nivel-1', seccionId: null, añoAcademico: 2026,
    estado: overrides.estado ?? 'PENDIENTE', observaciones: null, matriculaId: null,
    createdAt: new Date(), updatedAt: new Date(),
  });
}

function buildAlumno(estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO' = 'ACTIVO'): Alumno {
  return Alumno.reconstitute({
    id: 'alumno-1', personaId: 'persona-1', colegioId: 'colegio-1',
    dni: '12345678', nombres: 'Juan', apellidos: 'Pérez',
    fechaNac: new Date('2010-05-15'), genero: 'MASCULINO',
    telefono: null, direccion: null, codigoMatricula: '2025-ABC',
    estado, colegioOrigenRef: null, createdAt: new Date(), updatedAt: new Date(),
  });
}

const mockPrematriculaRepo: jest.Mocked<PrematriculaRepository> = {
  crear: jest.fn(), buscarPorId: jest.fn(),
  listarPorColegio: jest.fn(), listarPorAlumno: jest.fn(), actualizar: jest.fn(),
};
const mockAlumnoRepo: jest.Mocked<AlumnoRepository> = {
  crear: jest.fn(), buscarPorId: jest.fn(), buscarPorDni: jest.fn(),
  listarPorColegio: jest.fn(), actualizar: jest.fn(), cambiarEstado: jest.fn(),
};
const mockMatriculaRepo: jest.Mocked<MatriculaRepository> = {
  crear: jest.fn(), buscarPorId: jest.fn(), listarPorAlumno: jest.fn(),
  listarPorSeccion: jest.fn(), cambiarEstado: jest.fn(), existeMatriculaActiva: jest.fn(),
};

describe('ConfirmarPrematriculaUseCase', () => {
  let useCase: ConfirmarPrematriculaUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ConfirmarPrematriculaUseCase(mockPrematriculaRepo, mockAlumnoRepo, mockMatriculaRepo);
  });

  it('crea la matrícula y enlaza la prematricula al confirmar', async () => {
    mockPrematriculaRepo.buscarPorId.mockResolvedValue(buildPrematricula());
    mockAlumnoRepo.buscarPorId.mockResolvedValue(buildAlumno());
    mockMatriculaRepo.existeMatriculaActiva.mockResolvedValue(false);
    mockMatriculaRepo.crear.mockResolvedValue(
      Matricula.reconstitute({ id: 'mat-1', perfilAlumnoId: 'alumno-1', seccionId: 'seccion-1', añoAcademico: 2026, estado: 'NUEVA_MATRICULA', observaciones: null, createdAt: new Date(), updatedAt: new Date() }),
    );
    mockPrematriculaRepo.actualizar.mockResolvedValue(
      Prematricula.reconstitute({ id: 'pre-1', colegioId: 'colegio-1', alumnoId: 'alumno-1', colegioNivelId: 'nivel-1', seccionId: 'seccion-1', añoAcademico: 2026, estado: 'CONFIRMADA', observaciones: null, matriculaId: 'mat-1', createdAt: new Date(), updatedAt: new Date() }),
    );

    const result = await useCase.execute('colegio-1', 'pre-1', { seccionId: 'seccion-1' });

    expect(result.ok).toBe(true);
    expect(mockMatriculaRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ perfilAlumnoId: 'alumno-1', seccionId: 'seccion-1', añoAcademico: 2026 }),
    );
    expect(mockPrematriculaRepo.actualizar).toHaveBeenCalledWith('pre-1',
      expect.objectContaining({ estado: 'CONFIRMADA', matriculaId: 'mat-1' }),
    );
  });

  it('falla con CONFLICT cuando no está PENDIENTE', async () => {
    mockPrematriculaRepo.buscarPorId.mockResolvedValue(buildPrematricula({ estado: 'CANCELADA' }));

    const result = await useCase.execute('colegio-1', 'pre-1', { seccionId: 'seccion-1' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(mockMatriculaRepo.crear).not.toHaveBeenCalled();
  });

  it('falla con CONFLICT cuando el alumno no está ACTIVO', async () => {
    mockPrematriculaRepo.buscarPorId.mockResolvedValue(buildPrematricula());
    mockAlumnoRepo.buscarPorId.mockResolvedValue(buildAlumno('RETIRADO'));

    const result = await useCase.execute('colegio-1', 'pre-1', { seccionId: 'seccion-1' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('falla con NOT_FOUND cuando no existe', async () => {
    mockPrematriculaRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', 'inexistente', { seccionId: 'seccion-1' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});
