import { MatricularAlumnoUseCase } from './matricular-alumno.use-case';
import { AlumnoRepository } from '@modules/alumnos/domain/repositories/alumno.repository';
import { MatriculaRepository } from '../../domain/repositories/matricula.repository';
import { Alumno } from '@modules/alumnos/domain/entities/alumno.entity';
import { Matricula } from '../../domain/entities/matricula.entity';

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

const mockAlumnoRepo: jest.Mocked<AlumnoRepository> = {
  crear: jest.fn(), buscarPorId: jest.fn(), buscarPorDni: jest.fn(),
  listarPorColegio: jest.fn(), actualizar: jest.fn(), cambiarEstado: jest.fn(),
};
const mockMatriculaRepo: jest.Mocked<MatriculaRepository> = {
  crear: jest.fn(), buscarPorId: jest.fn(), listarPorAlumno: jest.fn(),
  listarPorSeccion: jest.fn(), cambiarEstado: jest.fn(), existeMatriculaActiva: jest.fn(),
};

describe('MatricularAlumnoUseCase', () => {
  let useCase: MatricularAlumnoUseCase;

  beforeEach(() => { jest.clearAllMocks(); useCase = new MatricularAlumnoUseCase(mockAlumnoRepo, mockMatriculaRepo); });

  it('matricula el alumno cuando no tiene matrícula activa ese año', async () => {
    mockAlumnoRepo.buscarPorId.mockResolvedValue(buildAlumno());
    mockMatriculaRepo.existeMatriculaActiva.mockResolvedValue(false);
    mockMatriculaRepo.crear.mockResolvedValue(
      Matricula.reconstitute({ id: 'mat-1', perfilAlumnoId: 'alumno-1', seccionId: 'seccion-1', añoAcademico: 2026, estado: 'NUEVA_MATRICULA', observaciones: null, createdAt: new Date(), updatedAt: new Date() }),
    );

    const result = await useCase.execute('colegio-1', { alumnoId: 'alumno-1', seccionId: 'seccion-1', añoAcademico: 2026 });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.estado).toBe('NUEVA_MATRICULA');
    expect(mockMatriculaRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ perfilAlumnoId: 'alumno-1', seccionId: 'seccion-1', añoAcademico: 2026 }),
    );
  });

  it('falla con CONFLICT cuando ya tiene matrícula activa ese año', async () => {
    mockAlumnoRepo.buscarPorId.mockResolvedValue(buildAlumno());
    mockMatriculaRepo.existeMatriculaActiva.mockResolvedValue(true);

    const result = await useCase.execute('colegio-1', { alumnoId: 'alumno-1', seccionId: 'seccion-1', añoAcademico: 2026 });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(mockMatriculaRepo.crear).not.toHaveBeenCalled();
  });

  it('falla con CONFLICT cuando el alumno no está ACTIVO', async () => {
    mockAlumnoRepo.buscarPorId.mockResolvedValue(buildAlumno({ estado: 'RETIRADO' }));

    const result = await useCase.execute('colegio-1', { alumnoId: 'alumno-1', seccionId: 'seccion-1', añoAcademico: 2026 });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('falla con NOT_FOUND cuando el alumno no existe', async () => {
    mockAlumnoRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', { alumnoId: 'inexistente', seccionId: 'seccion-1', añoAcademico: 2026 });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});
