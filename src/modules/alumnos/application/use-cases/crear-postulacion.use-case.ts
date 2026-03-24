import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { POSTULACION_REPOSITORY, type PostulacionRepository } from '../../domain/repositories/postulacion.repository';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '@modules/colegios/domain/repositories/colegio.repository';
import { CrearPostulacionDto } from '../dtos/crear-postulacion.dto';
import { PostulacionResponseDto } from '../dtos/postulacion-response.dto';
import { Postulacion } from '../../domain/entities/postulacion.entity';

@Injectable()
export class CrearPostulacionUseCase {
  constructor(
    @Inject(POSTULACION_REPOSITORY)
    private readonly postulacionRepository: PostulacionRepository,
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string, dto: CrearPostulacionDto): Promise<Result<PostulacionResponseDto>> {
    const colegio = await this.colegioRepository.buscarPorId(colegioId);
    if (!colegio) return fail(new NotFoundError('Colegio', colegioId));

    const postulacion = await this.postulacionRepository.crear({
      colegioId,
      sedeId:         dto.sedeId,
      nombres:        dto.nombres,
      apellidos:      dto.apellidos,
      dni:            dto.dni,
      fechaNac:       new Date(dto.fechaNac),
      genero:         dto.genero,
      colegioNivelId: dto.colegioNivelId,
      añoAcademico:   dto.añoAcademico,
      observaciones:  dto.observaciones,
    });

    return ok(toDto(postulacion));
  }
}

export function toDto(p: Postulacion): PostulacionResponseDto {
  return {
    id:             p.id,
    colegioId:      p.colegioId,
    sedeId:         p.sedeId,
    nombres:        p.nombres,
    apellidos:      p.apellidos,
    dni:            p.dni,
    fechaNac:       p.fechaNac,
    genero:         p.genero,
    colegioNivelId: p.colegioNivelId,
    añoAcademico:   p.añoAcademico,
    estado:         p.estado,
    observaciones:  p.observaciones,
    perfilAlumnoId: p.perfilAlumnoId,
    createdAt:      p.createdAt,
    updatedAt:      p.updatedAt,
  };
}
