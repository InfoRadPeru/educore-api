// Qué es: Tests unitarios del LoginUseCase.
// Patrón: AAA (Arrange, Act, Assert) — cada test tiene tres secciones claras.
// Por qué mocks: El use case depende de UsuarioRepository (interfaz). En el test inyectamos un mock que controla exactamente qué retorna el repositorio. Así testeamos el use case en aislamiento total, sin base de datos.

import { Usuario } from "@modules/auth/domain/entities/usuario.entity";
import { Rol } from "@modules/auth/domain/enums/estado-usuario.enum";
import { UsuarioRepository } from "@modules/auth/domain/repositories/usuario.repository";
import { Email } from "@modules/auth/domain/value-objects/email.vo";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { LoginUseCase } from "./login.use-case";

// npm run test

const buildUsuario = async (): Promise<Usuario> => {
  const emailResult = Email.create('admin@educore.pe');
  if (!emailResult.ok) throw new Error('Email inválido en test');
  const email = emailResult.value;
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  return Usuario.reconstitute({
    id:           'user-1',
    email,
    passwordHash,
    rol:          Rol.ADMIN,
    activo:       true,
    creadoEn:     new Date(),
  });
};

const mockRepository: jest.Mocked<UsuarioRepository> = {
  findByEmail:   jest.fn(),
  findById:      jest.fn(),
  existsByEmail: jest.fn(),
  create:        jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('token.jwt'),
} as unknown as JwtService;

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(mockRepository, mockJwtService);
  });

  it('retorna token cuando las credenciales son correctas', async () => {
    // Arrange
    const usuario = await buildUsuario();
    mockRepository.findByEmail.mockResolvedValue(usuario);

    // Act
    const result = await useCase.execute({
      email:    'admin@educore.pe',
      password: 'Admin123!',
    });

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.accessToken).toBe('token.jwt');
      expect(result.value.usuario.email).toBe('admin@educore.pe');
    }
  });

  it('falla cuando el usuario no existe', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({
      email:    'noexiste@educore.pe',
      password: 'cualquiera',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('falla cuando la contraseña es incorrecta', async () => {
    const usuario = await buildUsuario();
    mockRepository.findByEmail.mockResolvedValue(usuario);

    const result = await useCase.execute({
      email:    'admin@educore.pe',
      password: 'incorrecta',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('falla cuando el usuario está inactivo', async () => {
    const emailResult = Email.create('admin@educore.pe');
    if (!emailResult.ok) throw new Error('Email inválido en test');
    const email = emailResult.value;
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    const inactivo = Usuario.reconstitute({
      id:           'user-1',
      email,
      passwordHash,
      rol:          Rol.ADMIN,
      activo:       false,
      creadoEn:     new Date(),
    });
    mockRepository.findByEmail.mockResolvedValue(inactivo);

    const result = await useCase.execute({
      email:    'admin@educore.pe',
      password: 'Admin123!',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('retorna el mismo error para usuario inexistente y contraseña incorrecta', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    const r1 = await useCase.execute({ email: 'no@existe.pe', password: 'x' });

    const usuario = await buildUsuario();
    mockRepository.findByEmail.mockResolvedValue(usuario);
    const r2 = await useCase.execute({ email: 'admin@educore.pe', password: 'mal' });

    expect(!r1.ok && !r2.ok && r1.error.code).toBe(r2.ok ? '' : r2.error.code);
  });
});