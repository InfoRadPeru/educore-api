import { RegistrarDocenteUseCase } from './registrar-docente.use-case';
import { DocenteRepository } from '../../domain/repositories/docente.repository';
import { UsuarioRepository } from '@modules/auth/domain/repositories/usuario.repository';
import { Docente } from '../../domain/entities/docente.entity';

function buildDocente(usuarioId: string | null = null): Docente {
  return Docente.reconstitute({
    id: 'doc-1', personaId: 'persona-1', colegioId: 'colegio-1',
    sedeId: null, especialidad: null, estado: 'ACTIVO',
    dni: '12345678', nombres: 'Pedro', apellidos: 'Rojas',
    telefono: null, usuarioId, createdAt: new Date(), updatedAt: new Date(),
  });
}

const mockDocenteRepo: jest.Mocked<DocenteRepository> = {
  crearConPersona:      jest.fn(),
  buscarPorId:          jest.fn(),
  buscarPorDni:         jest.fn(),
  listarPorColegio:     jest.fn(),
  actualizar:           jest.fn(),
  cambiarEstado:        jest.fn(),
  asignarSeccion:       jest.fn(),
  removerAsignacion:    jest.fn(),
  buscarAsignacion:     jest.fn(),
  listarAsignaciones:   jest.fn(),
  existeAsignacion:     jest.fn(),
  esTutorEnColegio:     jest.fn(),
  existeTutorEnSeccion: jest.fn(),
};

const mockUsuarioRepo: jest.Mocked<UsuarioRepository> = {
  buscarPorEmail:              jest.fn(),
  buscarPorId:                 jest.fn(),
  buscarPorIdentifier:         jest.fn(),
  existePorEmail:              jest.fn(),
  crear:                       jest.fn(),
  crearParaPersona:            jest.fn(),
  incrementarIntentosFallidos: jest.fn(),
  bloquearCuenta:              jest.fn(),
  resetearIntentosFallidos:    jest.fn(),
  actualizarUltimoAcceso:      jest.fn(),
  actualizarPassword:          jest.fn(),
};

const dto = {
  dni: '12345678', nombres: 'Pedro', apellidos: 'Rojas',
  fechaNac: new Date('1985-03-10'), genero: 'MASCULINO' as const,
  crearAcceso: false,
};

describe('RegistrarDocenteUseCase', () => {
  let useCase: RegistrarDocenteUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegistrarDocenteUseCase(mockDocenteRepo, mockUsuarioRepo);
  });

  it('registra docente cuando no existe en el colegio', async () => {
    mockDocenteRepo.buscarPorDni.mockResolvedValue(null);
    mockDocenteRepo.crearConPersona.mockResolvedValue(buildDocente());

    const result = await useCase.execute('colegio-1', dto);

    expect(result.ok).toBe(true);
    expect(mockDocenteRepo.crearConPersona).toHaveBeenCalledWith(
      expect.objectContaining({ dni: '12345678', colegioId: 'colegio-1' }),
    );
  });

  it('falla con CONFLICT si ya existe docente con ese DNI en el colegio', async () => {
    mockDocenteRepo.buscarPorDni.mockResolvedValue(buildDocente());

    const result = await useCase.execute('colegio-1', dto);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(mockDocenteRepo.crearConPersona).not.toHaveBeenCalled();
  });

  it('crea usuario cuando crearAcceso=true y el docente no tiene cuenta', async () => {
    mockDocenteRepo.buscarPorDni.mockResolvedValue(null);
    mockDocenteRepo.crearConPersona.mockResolvedValue(buildDocente(null));
    mockUsuarioRepo.crearParaPersona.mockResolvedValue({} as any);

    const result = await useCase.execute('colegio-1', { ...dto, crearAcceso: true, password: 'Clave123!' });

    expect(result.ok).toBe(true);
    expect(mockUsuarioRepo.crearParaPersona).toHaveBeenCalledWith(
      expect.objectContaining({ username: '12345678', personaId: 'persona-1' }),
    );
  });

  it('no crea usuario cuando el docente ya tiene cuenta', async () => {
    mockDocenteRepo.buscarPorDni.mockResolvedValue(null);
    mockDocenteRepo.crearConPersona.mockResolvedValue(buildDocente('usuario-existente'));

    await useCase.execute('colegio-1', { ...dto, crearAcceso: true, password: 'Clave123!' });

    expect(mockUsuarioRepo.crearParaPersona).not.toHaveBeenCalled();
  });
});
