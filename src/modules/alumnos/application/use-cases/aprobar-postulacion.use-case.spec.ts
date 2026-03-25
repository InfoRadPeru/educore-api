import { AprobarPostulacionUseCase } from './aprobar-postulacion.use-case';
import { PostulacionRepository } from '../../domain/repositories/postulacion.repository';
import { AlumnoRepository } from '../../domain/repositories/alumno.repository';
import { MatriculaRepository } from '../../domain/repositories/matricula.repository';
import { Postulacion } from '../../domain/entities/postulacion.entity';
import { Alumno } from '../../domain/entities/alumno.entity';
import { Matricula } from '../../domain/entities/matricula.entity';

function buildPostulacion(overrides: Partial<{ colegioId: string; estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'EXPIRADA' }> = {}): Postulacion {
  return Postulacion.reconstitute({
    id:             'post-1',
    colegioId:      overrides.colegioId ?? 'colegio-1',
    sedeId:         null,
    nombres:        'Ana',
    apellidos:      'García',
    dni:            '87654321',
    fechaNac:       new Date('2011-03-20'),
    genero:         'FEMENINO',
    colegioNivelId: 'nivel-1',
    añoAcademico:   2026,
    estado:         overrides.estado ?? 'PENDIENTE',
    observaciones:  null,
    perfilAlumnoId: null,
    createdAt:      new Date(),
    updatedAt:      new Date(),
  });
}

function buildAlumno(): Alumno {
  return Alumno.reconstitute({
    id: 'alumno-nuevo', personaId: 'persona-nueva', colegioId: 'colegio-1',
    dni: '87654321', nombres: 'Ana', apellidos: 'García',
    fechaNac: new Date('2011-03-20'), genero: 'FEMENINO',
    telefono: null, direccion: null, codigoMatricula: '2026-XYZ',
    estado: 'ACTIVO', colegioOrigenRef: null, createdAt: new Date(), updatedAt: new Date(),
  });
}

function buildMatricula(): Matricula {
  return Matricula.reconstitute({
    id: 'mat-1', perfilAlumnoId: 'alumno-nuevo', seccionId: 'seccion-1',
    añoAcademico: 2026, estado: 'NUEVA_MATRICULA',
    observaciones: null, createdAt: new Date(), updatedAt: new Date(),
  });
}

const mockPostulacionRepo: jest.Mocked<PostulacionRepository> = {
  crear: jest.fn(), buscarPorId: jest.fn(),
  listarPorColegio: jest.fn(), actualizar: jest.fn(),
};
const mockAlumnoRepo: jest.Mocked<AlumnoRepository> = {
  crear: jest.fn(), buscarPorId: jest.fn(), buscarPorDni: jest.fn(),
  listarPorColegio: jest.fn(), actualizar: jest.fn(), cambiarEstado: jest.fn(),
};
const mockMatriculaRepo: jest.Mocked<MatriculaRepository> = {
  crear: jest.fn(), buscarPorId: jest.fn(), listarPorAlumno: jest.fn(),
  listarPorSeccion: jest.fn(), cambiarEstado: jest.fn(), existeMatriculaActiva: jest.fn(),
};

describe('AprobarPostulacionUseCase', () => {
  let useCase: AprobarPostulacionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new AprobarPostulacionUseCase(mockPostulacionRepo, mockAlumnoRepo, mockMatriculaRepo);
  });

  it('crea el alumno, la matrícula y enlaza la postulacion al aprobarse', async () => {
    mockPostulacionRepo.buscarPorId.mockResolvedValue(buildPostulacion());
    mockAlumnoRepo.buscarPorDni.mockResolvedValue(null);
    mockAlumnoRepo.crear.mockResolvedValue(buildAlumno());
    mockMatriculaRepo.crear.mockResolvedValue(buildMatricula());
    mockPostulacionRepo.actualizar.mockResolvedValue(buildPostulacion({ estado: 'APROBADA' }));

    const result = await useCase.execute('colegio-1', 'post-1', { seccionId: 'seccion-1' });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.estado).toBe('APROBADA');
    expect(mockAlumnoRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ dni: '87654321', colegioId: 'colegio-1' }),
    );
    expect(mockMatriculaRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ seccionId: 'seccion-1', añoAcademico: 2026 }),
    );
    expect(mockPostulacionRepo.actualizar).toHaveBeenCalledWith('post-1',
      expect.objectContaining({ estado: 'APROBADA', perfilAlumnoId: 'alumno-nuevo' }),
    );
  });

  it('falla con CONFLICT cuando la postulación no está en estado PENDIENTE', async () => {
    mockPostulacionRepo.buscarPorId.mockResolvedValue(buildPostulacion({ estado: 'RECHAZADA' }));

    const result = await useCase.execute('colegio-1', 'post-1', { seccionId: 'seccion-1' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(mockAlumnoRepo.crear).not.toHaveBeenCalled();
    expect(mockMatriculaRepo.crear).not.toHaveBeenCalled();
  });

  it('falla con CONFLICT cuando el DNI del postulante ya existe como alumno en el colegio', async () => {
    mockPostulacionRepo.buscarPorId.mockResolvedValue(buildPostulacion());
    mockAlumnoRepo.buscarPorDni.mockResolvedValue(buildAlumno());

    const result = await useCase.execute('colegio-1', 'post-1', { seccionId: 'seccion-1' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(mockAlumnoRepo.crear).not.toHaveBeenCalled();
  });

  it('falla con NOT_FOUND cuando la postulación no existe', async () => {
    mockPostulacionRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', 'inexistente', { seccionId: 'seccion-1' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('falla con NOT_FOUND cuando la postulación pertenece a otro colegio', async () => {
    mockPostulacionRepo.buscarPorId.mockResolvedValue(buildPostulacion({ colegioId: 'colegio-2' }));

    const result = await useCase.execute('colegio-1', 'post-1', { seccionId: 'seccion-1' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});
