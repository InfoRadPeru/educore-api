import { RegistrarApoderadoUseCase } from './registrar-apoderado.use-case';
import { ApoderadoRepository } from '../../domain/repositories/apoderado.repository';
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
  crearConPersonaYAcceso:    jest.fn(),
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

describe('RegistrarApoderadoUseCase', () => {
  let useCase: RegistrarApoderadoUseCase;

  const dto = {
    colegioId:   'colegio-1',
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
    useCase = new RegistrarApoderadoUseCase(mockApoderadoRepo);
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

  it('usa crearConPersonaYAcceso cuando crearAcceso=true', async () => {
    mockApoderadoRepo.buscarPorDni.mockResolvedValue(null);
    mockApoderadoRepo.crearConPersonaYAcceso.mockResolvedValue({
      apoderado: buildApoderado(),
      usuarioCreado: true,
    });

    const result = await useCase.execute({ ...dto, crearAcceso: true, password: 'Segura123!' });

    expect(result.ok).toBe(true);
    expect(mockApoderadoRepo.crearConPersonaYAcceso).toHaveBeenCalledWith(
      expect.objectContaining({ dni: '12345678' }),
    );
    expect(mockApoderadoRepo.crearConPersona).not.toHaveBeenCalled();
  });

  it('no llama crearConPersonaYAcceso cuando crearAcceso=false', async () => {
    mockApoderadoRepo.buscarPorDni.mockResolvedValue(null);
    mockApoderadoRepo.crearConPersona.mockResolvedValue(buildApoderado());

    await useCase.execute(dto);

    expect(mockApoderadoRepo.crearConPersonaYAcceso).not.toHaveBeenCalled();
  });

  it('devuelve passwordGenerado=null cuando el usuario ya tenía acceso', async () => {
    mockApoderadoRepo.buscarPorDni.mockResolvedValue(null);
    mockApoderadoRepo.crearConPersonaYAcceso.mockResolvedValue({
      apoderado:    buildApoderado(),
      usuarioCreado: false, // ya tenía acceso como docente/admin
    });

    const result = await useCase.execute({ ...dto, crearAcceso: true });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.passwordGenerado).toBeNull();
  });
});
