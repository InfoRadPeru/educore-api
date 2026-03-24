import { RegistrarAlumnoUseCase } from './registrar-alumno.use-case';
import { AlumnoRepository } from '../../domain/repositories/alumno.repository';
import { Alumno } from '../../domain/entities/alumno.entity';

// ─── Helper ───────────────────────────────────────────────────────────────────
function buildAlumno(overrides: Partial<{ id: string; colegioId: string; dni: string }> = {}): Alumno {
  return Alumno.reconstitute({
    id:              overrides.id        ?? 'alumno-1',
    personaId:       'persona-1',
    colegioId:       overrides.colegioId ?? 'colegio-1',
    dni:             overrides.dni       ?? '12345678',
    nombres:         'Juan',
    apellidos:       'Pérez',
    fechaNac:        new Date('2010-05-15'),
    genero:          'MASCULINO',
    telefono:        null,
    direccion:       null,
    codigoMatricula: '2026-ABCD1234',
    estado:          'ACTIVO',
    colegioOrigenRef: null,
    createdAt:       new Date('2026-01-01'),
    updatedAt:       new Date('2026-01-01'),
  });
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
const mockRepo: jest.Mocked<AlumnoRepository> = {
  crear:            jest.fn(),
  buscarPorId:      jest.fn(),
  buscarPorDni:     jest.fn(),
  listarPorColegio: jest.fn(),
  actualizar:       jest.fn(),
  cambiarEstado:    jest.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('RegistrarAlumnoUseCase', () => {
  let useCase: RegistrarAlumnoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegistrarAlumnoUseCase(mockRepo);
  });

  it('registra el alumno y retorna el DTO cuando el DNI no existe en el colegio', async () => {
    // ARRANGE — no existe alumno con ese DNI en el colegio
    mockRepo.buscarPorDni.mockResolvedValue(null);
    mockRepo.crear.mockResolvedValue(buildAlumno());

    // ACT
    const result = await useCase.execute('colegio-1', {
      dni:      '12345678',
      nombres:  'Juan',
      apellidos: 'Pérez',
      fechaNac: '2010-05-15',
      genero:   'MASCULINO',
    });

    // ASSERT
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.dni).toBe('12345678');
      expect(result.value.estado).toBe('ACTIVO');
    }
    expect(mockRepo.buscarPorDni).toHaveBeenCalledWith('12345678', 'colegio-1');
    expect(mockRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ colegioId: 'colegio-1', dni: '12345678' }),
    );
  });

  it('falla con CONFLICT cuando ya existe un alumno con ese DNI en el colegio', async () => {
    // ARRANGE — ya hay un alumno con ese DNI
    mockRepo.buscarPorDni.mockResolvedValue(buildAlumno({ dni: '12345678' }));

    // ACT
    const result = await useCase.execute('colegio-1', {
      dni:      '12345678',
      nombres:  'Juan',
      apellidos: 'Pérez',
      fechaNac: '2010-05-15',
      genero:   'MASCULINO',
    });

    // ASSERT
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(mockRepo.crear).not.toHaveBeenCalled();
  });

  it('el mismo DNI en colegios distintos no genera conflicto', async () => {
    // ARRANGE — en 'colegio-2' existe ese DNI, pero en 'colegio-1' no
    mockRepo.buscarPorDni.mockResolvedValue(null); // busca en colegio-1, no lo encuentra
    mockRepo.crear.mockResolvedValue(buildAlumno());

    const result = await useCase.execute('colegio-1', {
      dni: '12345678', nombres: 'Juan', apellidos: 'Pérez',
      fechaNac: '2010-05-15', genero: 'MASCULINO',
    });

    expect(result.ok).toBe(true);
    // Confirma que busca con el colegioId correcto
    expect(mockRepo.buscarPorDni).toHaveBeenCalledWith('12345678', 'colegio-1');
  });

  it('genera el codigoMatricula con el año actual como prefijo', async () => {
    mockRepo.buscarPorDni.mockResolvedValue(null);
    mockRepo.crear.mockResolvedValue(buildAlumno());

    await useCase.execute('colegio-1', {
      dni: '12345678', nombres: 'Juan', apellidos: 'Pérez',
      fechaNac: '2010-05-15', genero: 'MASCULINO',
    });

    const año = new Date().getFullYear().toString();
    expect(mockRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        codigoMatricula: expect.stringMatching(new RegExp(`^${año}-`)),
      }),
    );
  });
});
