import { RechazarPostulacionUseCase } from './rechazar-postulacion.use-case';
import { PostulacionRepository } from '../../domain/repositories/postulacion.repository';
import { Postulacion } from '../../domain/entities/postulacion.entity';

function buildPostulacion(estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'EXPIRADA' = 'PENDIENTE'): Postulacion {
  return Postulacion.reconstitute({
    id: 'post-1', colegioId: 'colegio-1', sedeId: null,
    nombres: 'Ana', apellidos: 'García', dni: '87654321',
    fechaNac: new Date('2011-03-20'), genero: 'FEMENINO',
    colegioNivelId: 'nivel-1', añoAcademico: 2026,
    estado, observaciones: null, perfilAlumnoId: null,
    createdAt: new Date(), updatedAt: new Date(),
  });
}

const mockRepo: jest.Mocked<PostulacionRepository> = {
  crear: jest.fn(), buscarPorId: jest.fn(),
  listarPorColegio: jest.fn(), actualizar: jest.fn(),
};

describe('RechazarPostulacionUseCase', () => {
  let useCase: RechazarPostulacionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RechazarPostulacionUseCase(mockRepo);
  });

  it('rechaza la postulacion y persiste las observaciones', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildPostulacion('PENDIENTE'));
    mockRepo.actualizar.mockResolvedValue(buildPostulacion('RECHAZADA'));

    const result = await useCase.execute('colegio-1', 'post-1', 'Documentos incompletos');

    expect(result.ok).toBe(true);
    expect(mockRepo.actualizar).toHaveBeenCalledWith('post-1',
      expect.objectContaining({ estado: 'RECHAZADA', observaciones: 'Documentos incompletos' }),
    );
  });

  it('falla con CONFLICT cuando la postulación ya fue aprobada', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildPostulacion('APROBADA'));

    const result = await useCase.execute('colegio-1', 'post-1');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(mockRepo.actualizar).not.toHaveBeenCalled();
  });

  it('falla con CONFLICT cuando la postulación ya fue rechazada', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildPostulacion('RECHAZADA'));

    const result = await useCase.execute('colegio-1', 'post-1');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('falla con NOT_FOUND cuando la postulación no existe', async () => {
    mockRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', 'inexistente');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});
