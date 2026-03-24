import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Request } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { CrearPrematriculaUseCase }     from '../../application/use-cases/crear-prematricula.use-case';
import { ListarPrematriculasUseCase }   from '../../application/use-cases/listar-prematriculas.use-case';
import { ConfirmarPrematriculaUseCase } from '../../application/use-cases/confirmar-prematricula.use-case';
import { CancelarPrematriculaUseCase }  from '../../application/use-cases/cancelar-prematricula.use-case';

import { CrearPrematriculaDto }    from '../../application/dtos/crear-prematricula.dto';
import { ConfirmarPrematriculaDto } from '../../application/dtos/confirmar-prematricula.dto';
import type { EstadoPrematricula } from '../../domain/entities/prematricula.entity';

@ApiTags('Prematriculas')
@Controller('prematriculas')
export class PrematriculasController {
  constructor(
    private readonly crearPrematriculaUseCase:     CrearPrematriculaUseCase,
    private readonly listarPrematriculasUseCase:   ListarPrematriculasUseCase,
    private readonly confirmarPrematriculaUseCase: ConfirmarPrematriculaUseCase,
    private readonly cancelarPrematriculaUseCase:  CancelarPrematriculaUseCase,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Listar prematriculas del colegio (alumnos existentes)' })
  @ApiQuery({ name: 'estado', enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'], required: false })
  async listar(@Request() req: { user: JwtPayload }, @Query('estado') estado?: EstadoPrematricula) {
    const result = await this.listarPrematriculasUseCase.execute(req.user.colegioId!, estado);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear prematrícula para alumno existente' })
  async crear(@Request() req: { user: JwtPayload }, @Body() dto: CrearPrematriculaDto) {
    const result = await this.crearPrematriculaUseCase.execute(req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post(':id/confirmar')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar prematrícula: crea matrícula en sección' })
  async confirmar(@Request() req: { user: JwtPayload }, @Param('id') id: string, @Body() dto: ConfirmarPrematriculaDto) {
    const result = await this.confirmarPrematriculaUseCase.execute(req.user.colegioId!, id, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Post(':id/cancelar')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar prematrícula' })
  async cancelar(@Request() req: { user: JwtPayload }, @Param('id') id: string, @Body() dto: { observaciones?: string }) {
    const result = await this.cancelarPrematriculaUseCase.execute(req.user.colegioId!, id, dto.observaciones);
    if (!result.ok) throw result.error;
    return result.value;
  }
}
