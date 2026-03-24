import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ConflictError } from '@shared/domain/result';
import { ALUMNO_REPOSITORY, type AlumnoRepository } from '../../domain/repositories/alumno.repository';
import { RegistrarAlumnoDto } from '../dtos/registrar-alumno.dto';
import { AlumnoResponseDto } from '../dtos/alumno-response.dto';
import { Alumno } from '../../domain/entities/alumno.entity';

@Injectable()
export class RegistrarAlumnoUseCase {
  constructor(
    @Inject(ALUMNO_REPOSITORY)
    private readonly alumnoRepository: AlumnoRepository,
  ) {}

  async execute(colegioId: string, dto: RegistrarAlumnoDto): Promise<Result<AlumnoResponseDto>> {
    const existe = await this.alumnoRepository.buscarPorDni(dto.dni, colegioId);
    if (existe) return fail(new ConflictError(`Ya existe un alumno con DNI '${dto.dni}' en este colegio`));

    const codigoMatricula = generarCodigo(colegioId);

    const alumno = await this.alumnoRepository.crear({
      colegioId,
      dni:             dto.dni,
      nombres:         dto.nombres,
      apellidos:       dto.apellidos,
      fechaNac:        new Date(dto.fechaNac),
      genero:          dto.genero,
      telefono:        dto.telefono,
      direccion:       dto.direccion,
      codigoMatricula,
      colegioOrigenRef: dto.colegioOrigenRef,
    });

    return ok(toDto(alumno));
  }
}

// Genera un código de matrícula único: año + 8 caracteres aleatorios
function generarCodigo(colegioId: string): string {
  const año    = new Date().getFullYear();
  const sufijo = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${año}-${sufijo}`;
}

export function toDto(alumno: Alumno): AlumnoResponseDto {
  return {
    id:              alumno.id,
    colegioId:       alumno.colegioId,
    dni:             alumno.dni,
    nombres:         alumno.nombres,
    apellidos:       alumno.apellidos,
    fechaNac:        alumno.fechaNac,
    genero:          alumno.genero,
    telefono:        alumno.telefono,
    direccion:       alumno.direccion,
    codigoMatricula: alumno.codigoMatricula,
    estado:          alumno.estado,
    colegioOrigenRef: alumno.colegioOrigenRef,
    createdAt:       alumno.createdAt,
    updatedAt:       alumno.updatedAt,
  };
}
