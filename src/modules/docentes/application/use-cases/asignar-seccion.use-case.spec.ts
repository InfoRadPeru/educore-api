import { AsignarSeccionUseCase } from './asignar-seccion.use-case';
import { DocenteRepository } from '../../domain/repositories/docente.repository';
import { ColegioAsignaturaRepository } from '@modules/asignaturas/domain/repositories/colegio-asignatura.repository';
import { Docente, DocenteAsignacion } from '../../domain/entities/docente.entity';
import { ColegioAsignatura } from '@modules/asignaturas/domain/entities/asignatura.entity';

function buildDocente(estado: 'ACTIVO' | 'INACTIVO' | 'LICENCIA' = 'ACTIVO'): Docente {
  return Docente.reconstitute({
    id: 'doc-1', personaId: 'persona-1', colegioId: 'colegio-1',
    sedeId: null, especialidad: null, estado,
    dni: '12345678', nombres: 'Pedro', apellidos: 'Rojas',
    telefono: null, usuarioId: null, createdAt: new Date(), updatedAt: new Date(),
  });
}

function buildAsignatura(colegioId = 'colegio-1', activo = true): ColegioAsignatura {
  return ColegioAsignatura.reconstitute({
    id: 'asig-1', colegioId, asignaturaMaestraId: 'maestra-1',
    nombreMaestro: 'Matemáticas', nombreOverride: null, activo,
  });
}

function buildAsignacion(): DocenteAsignacion {
  return DocenteAsignacion.reconstitute({
    id: 'da-1', docenteId: 'doc-1', seccionId: 'sec-1',
    colegioAsignaturaId: 'asig-1', asignaturaNombre: 'Matemáticas',
    añoAcademico: 2026, esTutor: false, createdAt: new Date(),
  });
}

const mockDocenteRepo: jest.Mocked<DocenteRepository> = {
  crearConPersona: jest.fn(), buscarPorId: jest.fn(), buscarPorDni: jest.fn(),
  listarPorColegio: jest.fn(), actualizar: jest.fn(), cambiarEstado: jest.fn(),
  asignarSeccion: jest.fn(), removerAsignacion: jest.fn(), buscarAsignacion: jest.fn(),
  listarAsignaciones: jest.fn(), existeAsignacion: jest.fn(),
  esTutorEnColegio: jest.fn(), existeTutorEnSeccion: jest.fn(),
};

const mockAsignaturaRepo: jest.Mocked<ColegioAsignaturaRepository> = {
  listarPorColegio: jest.fn(), buscarPorId: jest.fn(),
  activar: jest.fn(), renombrar: jest.fn(), cambiarEstado: jest.fn(), existeEnColegio: jest.fn(),
};

const dto = { seccionId: 'sec-1', colegioAsignaturaId: 'asig-1', añoAcademico: 2026, esTutor: false };

describe('AsignarSeccionUseCase', () => {
  let useCase: AsignarSeccionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new AsignarSeccionUseCase(mockDocenteRepo, mockAsignaturaRepo);
  });

  it('asigna correctamente docente a sección y asignatura', async () => {
    mockDocenteRepo.buscarPorId.mockResolvedValue(buildDocente());
    mockAsignaturaRepo.buscarPorId.mockResolvedValue(buildAsignatura());
    mockDocenteRepo.existeAsignacion.mockResolvedValue(false);
    mockDocenteRepo.asignarSeccion.mockResolvedValue(buildAsignacion());

    const result = await useCase.execute('doc-1', 'colegio-1', dto);

    expect(result.ok).toBe(true);
    expect(mockDocenteRepo.asignarSeccion).toHaveBeenCalledWith(
      expect.objectContaining({ docenteId: 'doc-1', seccionId: 'sec-1', esTutor: false }),
    );
  });

  it('falla con CONFLICT si la asignación ya existe', async () => {
    mockDocenteRepo.buscarPorId.mockResolvedValue(buildDocente());
    mockAsignaturaRepo.buscarPorId.mockResolvedValue(buildAsignatura());
    mockDocenteRepo.existeAsignacion.mockResolvedValue(true);

    const result = await useCase.execute('doc-1', 'colegio-1', dto);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('falla con CONFLICT si el docente no está activo', async () => {
    mockDocenteRepo.buscarPorId.mockResolvedValue(buildDocente('LICENCIA'));

    const result = await useCase.execute('doc-1', 'colegio-1', dto);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('falla con CONFLICT si el docente ya es tutor en el colegio ese año', async () => {
    mockDocenteRepo.buscarPorId.mockResolvedValue(buildDocente());
    mockAsignaturaRepo.buscarPorId.mockResolvedValue(buildAsignatura());
    mockDocenteRepo.existeAsignacion.mockResolvedValue(false);
    mockDocenteRepo.esTutorEnColegio.mockResolvedValue(true);

    const result = await useCase.execute('doc-1', 'colegio-1', { ...dto, esTutor: true });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('falla con CONFLICT si la sección ya tiene tutor ese año', async () => {
    mockDocenteRepo.buscarPorId.mockResolvedValue(buildDocente());
    mockAsignaturaRepo.buscarPorId.mockResolvedValue(buildAsignatura());
    mockDocenteRepo.existeAsignacion.mockResolvedValue(false);
    mockDocenteRepo.esTutorEnColegio.mockResolvedValue(false);
    mockDocenteRepo.existeTutorEnSeccion.mockResolvedValue(true);

    const result = await useCase.execute('doc-1', 'colegio-1', { ...dto, esTutor: true });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('falla con NOT_FOUND si el docente no pertenece al colegio', async () => {
    mockDocenteRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('doc-1', 'colegio-1', dto);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});
