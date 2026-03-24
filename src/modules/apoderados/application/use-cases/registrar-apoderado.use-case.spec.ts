import { RegistrarApoderadoUseCase } from './registrar-apoderado.use-case';
import { ApoderadoRepository } from '../../domain/repositories/apoderado.repository';
import { UsuarioRepository } from '@modules/auth/domain/repositories/usuario.repository';
import { Apoderado } from '../../domain/entities/apoderado.entity';

function buildApoderado(): Apoderado {
  return Apoderado.reconstitute({
    id:        'apo-1',
    personaId: 'persona-1',
    dni:       '12345678',
    nombres:   'Rosa',
    apellidos: 'López',
    telefono:  null,
    usuarioId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
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

describe('RegistrarApoderadoUseCase', () => {
  let useCase: RegistrarApoderadoUseCase;

  const dto = {
    dni:         '12345678',
    nombres:     'Rosa',
    apellidos:   'López',
    telefono:    undefined,
    fechaNac:    new Date('1985-06-20'),
    genero:      'FEMENINO' as const,
    crearAcceso: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegistrarApoderadoUseCase(mockApoderadoRepo, mockUsuarioRepo);
  });

  it('registra apoderado cuando no existe ninguno con ese DNI', async () => {
    mockApoderadoRepo.buscarPorDni.mockResolvedValue(null);
    mockApoderadoRepo.crearConPersona.mockResolvedValue(buildApoderado());

    const result = await useCase.execute(dto);

    expect(result.ok).toBe(true);
    expect(mockApoderadoRepo.crearConPersona).toHaveBeenCalledWith(
      expect.objectContaining({ dni: '12345678' }),
    );
  });

  it('falla con CONFLICT cuando ya existe apoderado con ese DNI', async () => {
    mockApoderadoRepo.buscarPorDni.mockResolvedValue(buildApoderado());

    const result = await useCase.execute(dto);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(mockApoderadoRepo.crearConPersona).not.toHaveBeenCalled();
  });

  it('crea usuario cuando crearAcceso=true con password proporcionado', async () => {
    mockApoderadoRepo.buscarPorDni.mockResolvedValue(null);
    mockApoderadoRepo.crearConPersona.mockResolvedValue(buildApoderado());
    mockUsuarioRepo.crearParaPersona.mockResolvedValue({} as any);

    const result = await useCase.execute({ ...dto, crearAcceso: true, password: 'Segura123!' });

    expect(result.ok).toBe(true);
    expect(mockUsuarioRepo.crearParaPersona).toHaveBeenCalledWith(
      expect.objectContaining({ username: '12345678', personaId: 'persona-1' }),
    );
  });

  it('no crea usuario cuando crearAcceso=false', async () => {
    mockApoderadoRepo.buscarPorDni.mockResolvedValue(null);
    mockApoderadoRepo.crearConPersona.mockResolvedValue(buildApoderado());

    await useCase.execute(dto);

    expect(mockUsuarioRepo.crearParaPersona).not.toHaveBeenCalled();
  });
});
