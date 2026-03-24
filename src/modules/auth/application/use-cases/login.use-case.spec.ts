// Qué es: Tests unitarios del LoginUseCase.
// Patrón: AAA (Arrange, Act, Assert) — cada test tiene tres secciones claras.
// Por qué mocks: El use case depende de UsuarioRepository (interfaz). En el test inyectamos un mock que controla exactamente qué retorna el repositorio. Así testeamos el use case en aislamiento total, sin base de datos.

import { Asignacion } from '@modules/auth/domain/entities/asignacion.entity';
import { Usuario } from '@modules/auth/domain/entities/usuario.entity';
import { EstadoUsuario } from '@modules/auth/domain/enums/estado-usuario.enum';
import { UsuarioRepository } from '@modules/auth/domain/repositories/usuario.repository';
import { AsignacionRepository } from '@modules/auth/domain/repositories/asignacion.repository';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { Email } from '@modules/auth/domain/value-objects/email.vo';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUseCase } from './login.use-case';

// npm run test

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildUsuario = async (estado: EstadoUsuario = EstadoUsuario.ACTIVO): Promise<Usuario> => {
  const emailResult = Email.create('admin@educore.pe');
  if (!emailResult.ok) throw new Error('Email inválido en test');
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  return Usuario.reconstitute({
    id:               'user-1',
    username:         '12345678',
    email:            emailResult.value,
    passwordHash,
    nombres:          'Admin',
    apellidos:        'Test',
    telefono:         null,
    avatarUrl:        null,
    estado,
    intentosFallidos: 0,
    bloqueadoHasta:   null,
    ultimoAcceso:     null,
    esPlatformAdmin:  false,
    createdAt:        new Date(),
  });
};

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUsuarioRepository: jest.Mocked<UsuarioRepository> = {
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

const mockAsignacionRepository: jest.Mocked<AsignacionRepository> = {
  findByUsuario: jest.fn(),
  findById:      jest.fn(),
};

const mockRefreshTokenRepository: jest.Mocked<RefreshTokenRepository> = {
  create:               jest.fn(),
  findByToken:          jest.fn(),
  revocarToken:         jest.fn(),
  revocarTodosDeUsuario: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('token.jwt'),
} as unknown as JwtService;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(
      mockUsuarioRepository,
      mockAsignacionRepository,
      mockRefreshTokenRepository,
      mockJwtService,
    );
  });

  it('retorna token con identifier=username', async () => {
    const usuario = await buildUsuario();
    const asignacion = Asignacion.reconstitute({
      id:            'asig-1',
      usuarioId:     'user-1',
      colegioId:     'colegio-1',
      colegioNombre: 'Colegio Test',
      sedeId:        null,
      sedeNombre:    null,
      rolId:         'rol-1',
      rolNombre:     'SUPER_ADMIN',
      esSistema:     true,
      permisos:      [],
      activo:        true,
    });
    mockUsuarioRepository.buscarPorIdentifier.mockResolvedValue(usuario);
    mockAsignacionRepository.findByUsuario.mockResolvedValue([asignacion]);
    mockRefreshTokenRepository.create.mockResolvedValue({} as any);

    const result = await useCase.execute({ identifier: '12345678', password: 'Admin123!' });

    expect(result.ok).toBe(true);
    if (result.ok && 'accessToken' in result.value) {
      expect(result.value.accessToken).toBe('token.jwt');
    }
  });

  it('falla cuando el usuario no existe', async () => {
    mockUsuarioRepository.buscarPorIdentifier.mockResolvedValue(null);

    const result = await useCase.execute({ identifier: '99999999', password: 'cualquiera' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('UNAUTHORIZED');
  });

  it('falla cuando la contraseña es incorrecta', async () => {
    const usuario = await buildUsuario();
    mockUsuarioRepository.buscarPorIdentifier.mockResolvedValue(usuario);
    mockUsuarioRepository.incrementarIntentosFallidos.mockResolvedValue(1);

    const result = await useCase.execute({ identifier: '12345678', password: 'incorrecta' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('UNAUTHORIZED');
  });

  it('falla cuando el usuario está inactivo', async () => {
    const inactivo = await buildUsuario(EstadoUsuario.INACTIVO);
    mockUsuarioRepository.buscarPorIdentifier.mockResolvedValue(inactivo);

    const result = await useCase.execute({ identifier: '12345678', password: 'Admin123!' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('UNAUTHORIZED');
  });

  it('retorna el mismo error para usuario inexistente y contraseña incorrecta', async () => {
    mockUsuarioRepository.buscarPorIdentifier.mockResolvedValue(null);
    const r1 = await useCase.execute({ identifier: '99999999', password: 'x' });

    const usuario = await buildUsuario();
    mockUsuarioRepository.buscarPorIdentifier.mockResolvedValue(usuario);
    mockUsuarioRepository.incrementarIntentosFallidos.mockResolvedValue(1);
    const r2 = await useCase.execute({ identifier: '12345678', password: 'mal' });

    expect(!r1.ok && !r2.ok && r1.error.code).toBe(r2.ok ? '' : r2.error.code);
  });
});