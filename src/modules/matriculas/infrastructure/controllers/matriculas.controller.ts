import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { MatricularAlumnoUseCase }       from '../../application/use-cases/matricular-alumno.use-case';
import { ListarMatriculasUseCase }       from '../../application/use-cases/listar-matriculas.use-case';
import { CambiarEstadoMatriculaUseCase } from '../../application/use-cases/cambiar-estado-matricula.use-case';

import { MatricularAlumnoDto }       from '../../application/dtos/matricular-alumno.dto';
import { CambiarEstadoMatriculaDto } from '../../application/dtos/cambiar-estado-matricula.dto';

@ApiTags('Matriculas')
@Controller('matriculas')
export class MatriculasController {
  constructor(
    private readonly matricularAlumnoUseCase:       MatricularAlumnoUseCase,
    private readonly listarMatriculasUseCase:       ListarMatriculasUseCase,
    private readonly cambiarEstadoMatriculaUseCase: CambiarEstadoMatriculaUseCase,
  ) {}

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Matricular alumno directamente en una sección' })
  async matricular(@Request() req: { user: JwtPayload }, @Body() dto: MatricularAlumnoDto) {
    const result = await this.matricularAlumnoUseCase.execute(req.user.colegioId!, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Listar matrículas de un alumno' })
  @ApiQuery({ name: 'alumnoId', required: true })
  async listar(@Request() req: { user: JwtPayload }, @Query('alumnoId') alumnoId: string) {
    const result = await this.listarMatriculasUseCase.execute(req.user.colegioId!, alumnoId);
    if (!result.ok) throw result.error;
    return result.value;
  }

  @Patch(':id/estado')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar estado de una matrícula' })
  async cambiarEstado(@Request() req: { user: JwtPayload }, @Param('id') id: string, @Body() dto: CambiarEstadoMatriculaDto) {
    const result = await this.cambiarEstadoMatriculaUseCase.execute(req.user.colegioId!, id, dto);
    if (!result.ok) throw result.error;
    return result.value;
  }
}
