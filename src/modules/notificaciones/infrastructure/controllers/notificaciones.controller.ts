import { Controller, Get, HttpCode, HttpStatus, Param, Patch, Query, Request } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        example: {
          id:        'uuid-notif',
          titulo:    'Nueva nota registrada',
          cuerpo:    'Se registró tu nota en Matemáticas — Examen Parcial.',
          leida:     false,
          createdAt: '2026-03-28T10:00:00.000Z',
        },
      },
    },
  })
  async listar(
    @Request() req: { user: JwtPayload },
    @Query('soloNoLeidas') soloNoLeidas?: string,
  ) {
    return this.listarUC.execute(req.user.sub, soloNoLeidas === 'true');
  }

  @Patch(':id/leer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @ApiNoContentResponse({ description: 'Notificación marcada como leída' })
  async marcarLeida(@Request() req: { user: JwtPayload }, @Param('id') id: string) {
    await this.marcarLeidaUC.execute(id, req.user.sub);
  }

  @Patch('leer-todas')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiNoContentResponse({ description: 'Todas las notificaciones marcadas como leídas' })
  async marcarTodas(@Request() req: { user: JwtPayload }) {
    await this.marcarTodasUC.execute(req.user.sub);
  }
}
