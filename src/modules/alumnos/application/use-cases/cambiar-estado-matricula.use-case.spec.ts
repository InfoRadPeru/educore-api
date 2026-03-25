import { CambiarEstadoMatriculaUseCase } from './cambiar-estado-matricula.use-case';
import { AlumnoRepository } from '../../domain/repositories/alumno.repository';
import { MatriculaRepository } from '../../domain/repositories/matricula.repository';
import { Alumno } from '../../domain/entities/alumno.entity';
import { Matricula } from '../../domain/entities/matricula.entity';

function buildAlumno(colegioId = 'colegio-1'): Alumno {
  return Alumno.reconstitute({
    id: 'alumno-1', personaId: 'persona-1', colegioId,
    dni: '12345678', nombres: 'Juan', apellidos: 'Pérez',
    fechaNac: new Date('2010-05-15'), genero: 'MASCULINO',
    telefono: null, direccion: null, codigoMatricula: '2026-ABC',
    estado: 'ACTIVO', colegioOrigenRef: null, createdAt: new Date(), updatedAt: new Date(),
  });
}

function buildMatricula(estado: Matricula['estado'] = 'NUEVA_MATRICULA'): Matricula {
  return Matricula.reconstitute({
    id: 'mat-1', perfilAlumnoId: 'alumno-1', seccionId: 'seccion-1',
    añoAcademico: 2026, estado,
    observaciones: null, createdAt: new Date(), updatedAt: new Date(),
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

describe('CambiarEstadoMatriculaUseCase', () => {
  let useCase: CambiarEstadoMatriculaUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CambiarEstadoMatriculaUseCase(mockAlumnoRepo, mockMatriculaRepo);
  });

  it('cambia el estado de la matrícula correctamente', async () => {
    mockMatriculaRepo.buscarPorId.mockResolvedValue(buildMatricula('NUEVA_MATRICULA'));
    mockAlumnoRepo.buscarPorId.mockResolvedValue(buildAlumno('colegio-1'));
    mockMatriculaRepo.cambiarEstado.mockResolvedValue(buildMatricula('MATRICULADO'));

    const result = await useCase.execute('colegio-1', 'mat-1', {
      estado: 'MATRICULADO', observaciones: 'Confirmado por secretaría',
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.estado).toBe('MATRICULADO');
    expect(mockMatriculaRepo.cambiarEstado).toHaveBeenCalledWith('mat-1', 'MATRICULADO', 'Confirmado por secretaría');
  });

  it('falla con NOT_FOUND cuando la matrícula no existe', async () => {
    mockMatriculaRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', 'inexistente', { estado: 'MATRICULADO' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('falla con NOT_FOUND cuando la matrícula pertenece a un alumno de otro colegio', async () => {
    // ARRANGE — matrícula existe, pero el alumno es de colegio-2
    mockMatriculaRepo.buscarPorId.mockResolvedValue(buildMatricula());
    mockAlumnoRepo.buscarPorId.mockResolvedValue(buildAlumno('colegio-2'));

    const result = await useCase.execute('colegio-1', 'mat-1', { estado: 'EXPULSADO' });

    // NOT_FOUND y no FORBIDDEN para no exponer que la matrícula existe en otro colegio
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
    expect(mockMatriculaRepo.cambiarEstado).not.toHaveBeenCalled();
  });
});
