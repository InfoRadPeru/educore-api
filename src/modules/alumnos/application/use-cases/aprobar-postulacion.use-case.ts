import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import { POSTULACION_REPOSITORY, type PostulacionRepository } from '../../domain/repositories/postulacion.repository';
import { ALUMNO_REPOSITORY, type AlumnoRepository } from '../../domain/repositories/alumno.repository';
import { MATRICULA_REPOSITORY, type MatriculaRepository } from '../../domain/repositories/matricula.repository';
import { AprobarPostulacionDto } from '../dtos/aprobar-postulacion.dto';
import { PostulacionResponseDto } from '../dtos/postulacion-response.dto';
import { toDto } from './crear-postulacion.use-case';

@Injectable()
export class AprobarPostulacionUseCase {
  constructor(
    @Inject(POSTULACION_REPOSITORY)
    private readonly postulacionRepository: PostulacionRepository,
    @Inject(ALUMNO_REPOSITORY)
    private readonly alumnoRepository: AlumnoRepository,
    @Inject(MATRICULA_REPOSITORY)
    private readonly matriculaRepository: MatriculaRepository,
  ) {}

  async execute(colegioId: string, postulacionId: string, dto: AprobarPostulacionDto): Promise<Result<PostulacionResponseDto>> {
    const postulacion = await this.postulacionRepository.buscarPorId(postulacionId);
    if (!postulacion || postulacion.colegioId !== colegioId) return fail(new NotFoundError('Postulacion', postulacionId));
    if (!postulacion.esPendiente()) return fail(new ConflictError('Solo se pueden aprobar postulaciones en estado PENDIENTE'));

    const alumnoExistente = await this.alumnoRepository.buscarPorDni(postulacion.dni, colegioId);
    if (alumnoExistente) return fail(new ConflictError(`Ya existe un alumno con DNI '${postulacion.dni}' en este colegio`));

    // 1. Crear Persona + PerfilAlumno
    const codigoMatricula = `${postulacion.añoAcademico}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const alumno = await this.alumnoRepository.crear({
      colegioId,
      dni:            postulacion.dni,
      nombres:        postulacion.nombres,
      apellidos:      postulacion.apellidos,
      fechaNac:       postulacion.fechaNac,
      genero:         postulacion.genero,
      codigoMatricula,
    });

    // 2. Crear Matrícula
    await this.matriculaRepository.crear({
      perfilAlumnoId: alumno.id,
      seccionId:      dto.seccionId,
      añoAcademico:   postulacion.añoAcademico,
      estado:         'NUEVA_MATRICULA',
      observaciones:  dto.observaciones,
    });

    // 3. Enlazar postulacion con el alumno creado
    postulacion.aprobar(alumno.id);
    const actualizada = await this.postulacionRepository.actualizar(postulacionId, {
      estado:        postulacion.estado,
      perfilAlumnoId: postulacion.perfilAlumnoId,
    });

    return ok(toDto(actualizada));
  }
}
