import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Request } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { CrearPostulacionUseCase }    from '../../application/use-cases/crear-postulacion.use-case';
import { ListarPostulacionesUseCase } from '../../application/use-cases/listar-postulaciones.use-case';
import { AprobarPostulacionUseCase }  from '../../application/use-cases/aprobar-postulacion.use-case';
import { RechazarPostulacionUseCase } from '../../application/use-cases/rechazar-postulacion.use-case';

import { CrearPostulacionDto }    from '../../application/dtos/crear-postulacion.dto';
import { AprobarPostulacionDto }  from '../../application/dtos/aprobar-postulacion.dto';
import type { EstadoPostulacion } from '../../domain/entities/postulacion.entity';

@ApiTags('Postulaciones')
@Controller('postulaciones')
export class PostulacionesController {
  constructor(
    private readonly crearPostulacionUseCase:    CrearPostulacionUseCase,
    private readonly listarPostulacionesUseCase: ListarPostulacionesUseCase,
    private readonly aprobarPostulacionUseCase:  AprobarPostulacionUseCase,
    private readonly rechazarPostulacionUseCase: RechazarPostulacionUseCase,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Listar postulaciones del colegio (nuevos alumnos)' })
  @ApiQuery({ name: 'estado', enum: ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'EXPIRADA'], required: false })
  async listar(@Request() req: { user: JwtPayload }, @Query('estado') estado?: EstadoPostulacion) {
    const result = await this.listarPostulacionesUseCase.execute(req.user.colegioId!, estado);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear postulación para nuevo alumno' })
  async crear(@Request() req: { user: JwtPayload }, @Body() dto: CrearPostulacionDto) {
    const result = await this.crearPostulacionUseCase.execute(req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post(':id/aprobar')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprobar postulación: crea alumno y matrícula' })
  async aprobar(@Request() req: { user: JwtPayload }, @Param('id') id: string, @Body() dto: AprobarPostulacionDto) {
    const result = await this.aprobarPostulacionUseCase.execute(req.user.colegioId!, id, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post(':id/rechazar')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rechazar postulación' })
  async rechazar(@Request() req: { user: JwtPayload }, @Param('id') id: string, @Body() dto: { observaciones?: string }) {
    const result = await this.rechazarPostulacionUseCase.execute(req.user.colegioId!, id, dto.observaciones);
    if (!result.ok) throw result.error;
    return result.value;
  }
}
