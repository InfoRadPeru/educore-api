import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { ListarAsignaturasColegioUseCase }    from '../../application/use-cases/listar-asignaturas-colegio.use-case';
import { ActivarAsignaturaColegioUseCase }    from '../../application/use-cases/activar-asignatura-colegio.use-case';
import { DesactivarAsignaturaColegioUseCase } from '../../application/use-cases/desactivar-asignatura-colegio.use-case';
import { RenombrarAsignaturaColegioUseCase }  from '../../application/use-cases/renombrar-asignatura-colegio.use-case';
import { ListarAsignaturasGradoUseCase }      from '../../application/use-cases/listar-asignaturas-grado.use-case';
import { AsignarAsignaturaGradoUseCase }      from '../../application/use-cases/asignar-asignatura-grado.use-case';
import { ActualizarHorasGradoUseCase }        from '../../application/use-cases/actualizar-horas-grado.use-case';
import { RemoverAsignaturaGradoUseCase }      from '../../application/use-cases/remover-asignatura-grado.use-case';
import { ListarAsignaturasMaestrasUseCase }   from '../../application/use-cases/listar-asignaturas-maestras.use-case';

import {
  ActivarAsignaturaColegioDto,
  RenombrarAsignaturaColegioDto,
  AsignarAsignaturaGradoDto,
  ActualizarHorasGradoDto,
} from '../../application/dtos/asignatura.dto';

@ApiTags('Asignaturas')
@Controller('asignaturas')
export class AsignaturasController {
  constructor(
    private readonly listarMaestrasUseCase:           ListarAsignaturasMaestrasUseCase,
    private readonly listarColegioUseCase:            ListarAsignaturasColegioUseCase,
    private readonly activarColegioUseCase:           ActivarAsignaturaColegioUseCase,
    private readonly desactivarColegioUseCase:        DesactivarAsignaturaColegioUseCase,
    private readonly renombrarColegioUseCase:         RenombrarAsignaturaColegioUseCase,
    private readonly listarGradoUseCase:              ListarAsignaturasGradoUseCase,
    private readonly asignarGradoUseCase:             AsignarAsignaturaGradoUseCase,
    private readonly actualizarHorasGradoUseCase:     ActualizarHorasGradoUseCase,
    private readonly removerGradoUseCase:             RemoverAsignaturaGradoUseCase,
  ) {}

  // ─── Catálogo maestro (lectura) ────────────────────────────────────────────

  @Get('maestras')
  @Auth()
  @ApiOperation({ summary: 'Listar catálogo global de asignaturas maestras' })
  async listarMaestras(@Query('soloActivas') soloActivas?: string) {
    const result = await this.listarMaestrasUseCase.execute(soloActivas === 'true');
    if (!result.ok) throw result.error;
    return result.value;
  }

  // ─── Asignaturas del colegio ────────────────────────────────────────────────

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Listar asignaturas activadas en el colegio' })
  async listarColegio(
    @Request() req: { user: JwtPayload },
    @Query('soloActivas') soloActivas?: string,
  ) {
    const result = await this.listarColegioUseCase.execute(req.user.colegioId!, soloActivas === 'true');
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('activar')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar asignatura maestra en el colegio' })
  async activar(
    @Request() req: { user: JwtPayload },
    @Body() dto: ActivarAsignaturaColegioDto,
  ) {
    const result = await this.activarColegioUseCase.execute(req.user.colegioId!, dto.asignaturaMaestraId);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id/desactivar')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar asignatura del colegio' })
  async desactivar(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
  ) {
    const result = await this.desactivarColegioUseCase.execute(req.user.colegioId!, id);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id/nombre')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renombrar asignatura en el colegio (null restaura nombre maestro)' })
  async renombrar(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: RenombrarAsignaturaColegioDto,
  ) {
    const result = await this.renombrarColegioUseCase.execute(req.user.colegioId!, id, dto.nombre);
    if (!result.ok) throw result.error;
    return result.value;
  }

  // ─── Currículo por grado ────────────────────────────────────────────────────

  @Get('grados/:colegioGradoId')
  @Auth()
  @ApiOperation({ summary: 'Listar asignaturas asignadas a un grado' })
  async listarGrado(@Param('colegioGradoId') colegioGradoId: string) {
    const result = await this.listarGradoUseCase.execute(colegioGradoId);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post('grados/:colegioGradoId')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar asignatura a un grado' })
  async asignarGrado(
    @Param('colegioGradoId') colegioGradoId: string,
    @Body() dto: AsignarAsignaturaGradoDto,
  ) {
    const result = await this.asignarGradoUseCase.execute({
      colegioGradoId,
      colegioAsignaturaId: dto.colegioAsignaturaId,
      horasSemanales:      dto.horasSemanales,
    });
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch('grados/asignaciones/:id/horas')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar horas semanales de una asignatura en el grado' })
  async actualizarHoras(
    @Param('id') id: string,
    @Body() dto: ActualizarHorasGradoDto,
  ) {
    const result = await this.actualizarHorasGradoUseCase.execute(id, dto.horasSemanales);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Delete('grados/asignaciones/:id')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover asignatura de un grado' })
  async removerGrado(@Param('id') id: string) {
    const result = await this.removerGradoUseCase.execute(id);
    if (!result.ok) throw result.error;
  }
}
