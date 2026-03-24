import { CancelarPrematriculaUseCase } from './cancelar-prematricula.use-case';
import { PrematriculaRepository } from '../../domain/repositories/prematricula.repository';
import { Prematricula } from '../../domain/entities/prematricula.entity';

function buildPrematricula(estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' = 'PENDIENTE'): Prematricula {
  return Prematricula.reconstitute({
    id: 'pre-1', colegioId: 'colegio-1', alumnoId: 'alumno-1',
    colegioNivelId: 'nivel-1', seccionId: null, añoAcademico: 2026,
    estado, observaciones: null, matriculaId: null,
    createdAt: new Date(), updatedAt: new Date(),
  });
}

const mockRepo: jest.Mocked<PrematriculaRepository> = {
  crear: jest.fn(), buscarPorId: jest.fn(),
  listarPorColegio: jest.fn(), listarPorAlumno: jest.fn(), actualizar: jest.fn(),
};

describe('CancelarPrematriculaUseCase', () => {
  let useCase: CancelarPrematriculaUseCase;

  beforeEach(() => { jest.clearAllMocks(); useCase = new CancelarPrematriculaUseCase(mockRepo); });

  it('cancela y persiste las observaciones', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildPrematricula('PENDIENTE'));
    mockRepo.actualizar.mockResolvedValue(buildPrematricula('CANCELADA'));

    const result = await useCase.execute('colegio-1', 'pre-1', 'Cambió de opinión');

    expect(result.ok).toBe(true);
    expect(mockRepo.actualizar).toHaveBeenCalledWith('pre-1',
      expect.objectContaining({ estado: 'CANCELADA', observaciones: 'Cambió de opinión' }),
    );
  });

  it('falla con CONFLICT cuando ya fue confirmada', async () => {
    mockRepo.buscarPorId.mockResolvedValue(buildPrematricula('CONFIRMADA'));

    const result = await useCase.execute('colegio-1', 'pre-1');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(mockRepo.actualizar).not.toHaveBeenCalled();
  });

  it('falla con NOT_FOUND cuando no existe', async () => {
    mockRepo.buscarPorId.mockResolvedValue(null);

    const result = await useCase.execute('colegio-1', 'inexistente');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});
