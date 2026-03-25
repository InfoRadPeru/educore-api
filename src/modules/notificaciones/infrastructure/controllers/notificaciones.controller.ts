import { Controller, Get, HttpCode, HttpStatus, Param, Patch, Query, Request } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';
import { ListarNotificacionesUseCase } from '../../application/use-cases/listar-notificaciones.use-case';
import { MarcarLeidaUseCase }          from '../../application/use-cases/marcar-leida.use-case';
import { MarcarTodasLeidasUseCase }    from '../../application/use-cases/marcar-todas-leidas.use-case';

@ApiTags('Notificaciones')
@Auth()
@Controller('notificaciones')
export class NotificacionesController {
  constructor(
    private readonly listarUC:         ListarNotificacionesUseCase,
    private readonly marcarLeidaUC:    MarcarLeidaUseCase,
    private readonly marcarTodasUC:    MarcarTodasLeidasUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificaciones del usuario autenticado' })
  @ApiQuery({ name: 'soloNoLeidas', required: false, type: Boolean })
  async listar(
    @Request() req: { user: JwtPayload },
    @Query('soloNoLeidas') soloNoLeidas?: string,
  ) {
    return this.listarUC.execute(req.user.sub, soloNoLeidas === 'true');
  }

  @Patch(':id/leer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  async marcarLeida(@Request() req: { user: JwtPayload }, @Param('id') id: string) {
    await this.marcarLeidaUC.execute(id, req.user.sub);
  }

  @Patch('leer-todas')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  async marcarTodas(@Request() req: { user: JwtPayload }) {
    await this.marcarTodasUC.execute(req.user.sub);
  }
}
