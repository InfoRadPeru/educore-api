import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { ALUMNO_REPOSITORY, type AlumnoRepository } from '../../domain/repositories/alumno.repository';
import { ActualizarAlumnoDto } from '../dtos/actualizar-alumno.dto';
import { AlumnoResponseDto } from '../dtos/alumno-response.dto';
import { toDto } from './registrar-alumno.use-case';

@Injectable()
export class ActualizarAlumnoUseCase {
  constructor(
    @Inject(ALUMNO_REPOSITORY)
    private readonly alumnoRepository: AlumnoRepository,
  ) {}

  async execute(colegioId: string, alumnoId: string, dto: ActualizarAlumnoDto): Promise<Result<AlumnoResponseDto>> {
    const alumno = await this.alumnoRepository.buscarPorId(alumnoId);
    if (!alumno || alumno.colegioId !== colegioId) return fail(new NotFoundError('Alumno', alumnoId));

    const actualizado = await this.alumnoRepository.actualizar(alumnoId, {
      nombres:          dto.nombres,
      apellidos:        dto.apellidos,
      fechaNac:         dto.fechaNac ? new Date(dto.fechaNac) : undefined,
      genero:           dto.genero,
      telefono:         dto.telefono,
      direccion:        dto.direccion,
      colegioOrigenRef: dto.colegioOrigenRef,
    });

    return ok(toDto(actualizado));
  }
}
