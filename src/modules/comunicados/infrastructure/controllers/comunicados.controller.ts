import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, Request,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { CrearComunicadoUseCase }              from '../../application/use-cases/crear-comunicado.use-case';
import { ActualizarComunicadoUseCase }         from '../../application/use-cases/actualizar-comunicado.use-case';
import { PublicarComunicadoUseCase }           from '../../application/use-cases/publicar-comunicado.use-case';
import { ArchivarComunicadoUseCase }           from '../../application/use-cases/archivar-comunicado.use-case';
import { EliminarComunicadoUseCase }           from '../../application/use-cases/eliminar-comunicado.use-case';
import { ListarComunicadosUseCase }            from '../../application/use-cases/listar-comunicados.use-case';
import { ObtenerComunicadoUseCase }            from '../../application/use-cases/obtener-comunicado.use-case';
import { ListarComunicadosApoderadoUseCase }   from '../../application/use-cases/listar-comunicados-apoderado.use-case';
import { MarcarComunicadoLeidoUseCase }        from '../../application/use-cases/marcar-comunicado-leido.use-case';
import { CrearComunicadoDto, ActualizarComunicadoDto } from '../../application/dtos/comunicado.dto';
import { AudienciaComunicado } from '../../domain/entities/comunicado.entity';

function toResponse(c: ReturnType<typeof import('../../domain/entities/comunicado.entity').Comunicado.reconstitute>) {
  return {
    id:             c.id,
    titulo:         c.titulo,
    contenido:      c.contenido,
    estado:         c.estado,
    audiencia:      c.audiencia,
    colegioNivelId: c.colegioNivelId,
    colegioGradoId: c.colegioGradoId,
    seccionId:      c.seccionId,
    destinatarioId: c.destinatarioId,
    añoAcademico:   c.añoAcademico,
    publicadoEn:    c.publicadoEn?.toISOString() ?? null,
    createdAt:      c.createdAt.toISOString(),
    updatedAt:      c.updatedAt.toISOString(),
  };
}

@ApiTags('Comunicados')
@Controller('comunicados')
export class ComunicadosController {
  constructor(
    private readonly crearComunicadoUseCase:            CrearComunicadoUseCase,
    private readonly actualizarComunicadoUseCase:       ActualizarComunicadoUseCase,
    private readonly publicarComunicadoUseCase:         PublicarComunicadoUseCase,
    private readonly archivarComunicadoUseCase:         ArchivarComunicadoUseCase,
    private readonly eliminarComunicadoUseCase:         EliminarComunicadoUseCase,
    private readonly listarComunicadosUseCase:          ListarComunicadosUseCase,
    private readonly obtenerComunicadoUseCase:          ObtenerComunicadoUseCase,
    private readonly listarComunicadosApoderadoUseCase: ListarComunicadosApoderadoUseCase,
    private readonly marcarComunicadoLeidoUseCase:      MarcarComunicadoLeidoUseCase,
  ) {}

  // ─── Rutas estáticas PRIMERO (antes de /:id) ──────────────────────────────

  @Get('apoderado/mios')
  @Auth()
  @ApiOperation({ summary: 'Listar mis comunicados (apoderado, solo publicados)' })
  @ApiQuery({ name: 'año', type: Number, example: 2026 })
  async listarMisComunicados(
    @Request() req: { user: JwtPayload },
    @Query('año') año: string,
  ) {
    const result = await this.listarComunicadosApoderadoUseCase.execute(
      req.user.sub,
      parseInt(año, 10),
    );
    if (!result.ok) throw result.error;
    return result.value.map(toResponse);
  }

  // ─── CRUD admin ───────────────────────────────────────────────────────────

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Crear comunicado (queda en BORRADOR)' })
  async crear(
    @Body() dto: CrearComunicadoDto,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.crearComunicadoUseCase.execute({
      colegioId:      req.user.colegioId!,
      autorId:        req.user.sub,
      titulo:         dto.titulo,
      contenido:      dto.contenido,
      audiencia:      dto.audiencia as AudienciaComunicado,
      colegioNivelId: dto.colegioNivelId,
      colegioGradoId: dto.colegioGradoId,
      seccionId:      dto.seccionId,
      destinatarioId: dto.destinatarioId,
      añoAcademico:   dto.añoAcademico,
    });
    if (!result.ok) throw result.error;
    return toResponse(result.value);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Listar comunicados del colegio' })
  @ApiQuery({ name: 'año', type: Number, required: false })
  async listar(
    @Request() req: { user: JwtPayload },
    @Query('año') año?: string,
  ) {
    const comunicados = await this.listarComunicadosUseCase.execute(
      req.user.colegioId!,
      año ? parseInt(año, 10) : undefined,
    );
    return comunicados.map(toResponse);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener comunicado por id' })
  async obtener(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.obtenerComunicadoUseCase.execute(id, req.user.colegioId!);
    if (!result.ok) throw result.error;
    return toResponse(result.value);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Actualizar comunicado (solo BORRADOR)' })
  async actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarComunicadoDto,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.actualizarComunicadoUseCase.execute(
      id,
      req.user.colegioId!,
      {
        titulo:         dto.titulo,
        contenido:      dto.contenido,
        audiencia:      dto.audiencia as AudienciaComunicado | undefined,
        colegioNivelId: dto.colegioNivelId,
        colegioGradoId: dto.colegioGradoId,
        seccionId:      dto.seccionId,
        destinatarioId: dto.destinatarioId,
      },
    );
    if (!result.ok) throw result.error;
    return toResponse(result.value);
  }

  @Post(':id/publicar')
  @Auth()
  @ApiOperation({ summary: 'Publicar comunicado' })
  async publicar(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.publicarComunicadoUseCase.execute(id, req.user.colegioId!);
    if (!result.ok) throw result.error;
    return toResponse(result.value);
  }

  @Post(':id/archivar')
  @Auth()
  @ApiOperation({ summary: 'Archivar comunicado publicado' })
  async archivar(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.archivarComunicadoUseCase.execute(id, req.user.colegioId!);
    if (!result.ok) throw result.error;
    return toResponse(result.value);
  }

  @Post(':id/leido')
  @Auth()
  @ApiOperation({ summary: 'Marcar comunicado como leído (apoderado)' })
  async marcarLeido(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.marcarComunicadoLeidoUseCase.execute(req.user.sub, id);
    if (!result.ok) throw result.error;
    return {
      id:           result.value.id,
      comunicadoId: result.value.comunicadoId,
      apoderadoId:  result.value.apoderadoId,
      leidoEn:      result.value.leidoEn.toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  @ApiOperation({ summary: 'Eliminar comunicado (solo BORRADOR)' })
  async eliminar(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ) {
    const result = await this.eliminarComunicadoUseCase.execute(id, req.user.colegioId!);
    if (!result.ok) throw result.error;
  }
}
