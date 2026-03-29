import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

const ASIGNATURA_MAESTRA_ADMIN_EXAMPLE = {
  id:          'uuid-asig-maestra',
  nombre:      'Matemáticas',
  descripcion: 'Aritmética, álgebra y geometría',
  activo:      true,
};
import { SoloPlatformAdmin } from '@modules/auth/infrastructure/guards/auth.guard';

import { ListarAsignaturasMaestrasUseCase }        from '../../application/use-cases/listar-asignaturas-maestras.use-case';
import { CrearAsignaturaMaestraUseCase }            from '../../application/use-cases/crear-asignatura-maestra.use-case';
import { ActualizarAsignaturaMaestraUseCase }       from '../../application/use-cases/actualizar-asignatura-maestra.use-case';
import { CambiarEstadoAsignaturaMaestraUseCase }    from '../../application/use-cases/cambiar-estado-asignatura-maestra.use-case';

import {
  CrearAsignaturaMaestraDto,
  ActualizarAsignaturaMaestraDto,
  CambiarEstadoAsignaturaDto,
} from '../../application/dtos/asignatura.dto';

@ApiTags('Admin — Asignaturas')
@Controller('admin/asignaturas')
export class AdminAsignaturasController {
  constructor(
    private readonly listarMaestrasUseCase:         ListarAsignaturasMaestrasUseCase,
    private readonly crearMaestraUseCase:           CrearAsignaturaMaestraUseCase,
    private readonly actualizarMaestraUseCase:      ActualizarAsignaturaMaestraUseCase,
    private readonly cambiarEstadoMaestraUseCase:   CambiarEstadoAsignaturaMaestraUseCase,
  ) {}

  @Get()
  @SoloPlatformAdmin()
  @ApiOperation({ summary: 'Listar catálogo global de asignaturas' })
  @ApiOkResponse({ schema: { type: 'array', items: { example: ASIGNATURA_MAESTRA_ADMIN_EXAMPLE } } })
  async listar(@Query('soloActivas') soloActivas?: string) {
    const result = await this.listarMaestrasUseCase.execute(soloActivas === 'true');
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post()
  @SoloPlatformAdmin()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear asignatura en el catálogo global' })
  @ApiCreatedResponse({ schema: { example: ASIGNATURA_MAESTRA_ADMIN_EXAMPLE } })
  async crear(@Body() dto: CrearAsignaturaMaestraDto) {
    const result = await this.crearMaestraUseCase.execute(dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id')
  @SoloPlatformAdmin()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar nombre o descripción de una asignatura maestra' })
  @ApiOkResponse({ schema: { example: ASIGNATURA_MAESTRA_ADMIN_EXAMPLE } })
  async actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarAsignaturaMaestraDto,
  ) {
    const result = await this.actualizarMaestraUseCase.execute(id, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id/estado')
  @SoloPlatformAdmin()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar o desactivar asignatura maestra' })
  @ApiOkResponse({ schema: { example: ASIGNATURA_MAESTRA_ADMIN_EXAMPLE } })
  async cambiarEstado(
    @Param('id') id: string,
    @Body() dto: CambiarEstadoAsignaturaDto,
  ) {
    const result = await this.cambiarEstadoMaestraUseCase.execute(id, dto.activo);
    if (!result.ok) throw result.error;
    return result.value;
  }
}
