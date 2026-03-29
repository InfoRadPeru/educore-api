import {
  BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, Request,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

const CONCEPTO_EXAMPLE = {
  id:        'uuid-concepto',
  colegioId: 'uuid-colegio',
  nombre:    'Pensión Mensual',
  tipo:      'PENSION',
};

const TARIFA_EXAMPLE = {
  id:               'uuid-tarifa',
  conceptoId:       'uuid-concepto',
  colegioNivelId:   'uuid-colegio-nivel',
  añoAcademico:     2026,
  monto:            350.00,
};

const CUOTA_EXAMPLE = {
  id:           'uuid-cuota',
  alumnoId:     'uuid-alumno',
  conceptoId:   'uuid-concepto',
  añoAcademico: 2026,
  mes:          3,
  monto:        350.00,
  estado:       'PENDIENTE',
  vencimiento:  '2026-03-15T00:00:00.000Z',
};

const PAGO_EXAMPLE = {
  id:              'uuid-pago',
  colegioId:       'uuid-colegio',
  metodoPago:      'EFECTIVO',
  referencia:      null,
  observacion:     null,
  estado:          'REGISTRADO',
  total:           700.00,
  registradoPorId: 'uuid-usuario',
  createdAt:       '2026-03-28T10:00:00.000Z',
};

const MOROSIDAD_EXAMPLE = {
  alumnoId:     'uuid-alumno',
  alumnoNombre: 'Carlos Pérez García',
  deuda:        700.00,
  cuotasVencidas: 2,
};

const RESUMEN_EXAMPLE = {
  año:          2026,
  totalCobrado: 15000.00,
  totalPendiente: 3500.00,
  totalVencido: 700.00,
};
import { Auth } from '@modules/auth/infrastructure/guards/auth.guard';
import { JwtPayload } from '@modules/auth/infrastructure/strategies/jwt.strategy';

import { CrearConceptoUseCase }         from '../../application/use-cases/crear-concepto.use-case';
import { ListarConceptosUseCase }       from '../../application/use-cases/listar-conceptos.use-case';
import { ActualizarConceptoUseCase }    from '../../application/use-cases/actualizar-concepto.use-case';
import { ConfigurarTarifaUseCase }      from '../../application/use-cases/configurar-tarifa.use-case';
import { ListarTarifasUseCase }         from '../../application/use-cases/listar-tarifas.use-case';
import { EliminarTarifaUseCase }        from '../../application/use-cases/eliminar-tarifa.use-case';
import { GenerarCuotasAlumnoUseCase }   from '../../application/use-cases/generar-cuotas-alumno.use-case';
import { ListarCuotasAlumnoUseCase }    from '../../application/use-cases/listar-cuotas-alumno.use-case';
import { ListarMorosidadUseCase }       from '../../application/use-cases/listar-morosidad.use-case';
import { RegistrarPagoUseCase }         from '../../application/use-cases/registrar-pago.use-case';
import { AnularPagoUseCase }            from '../../application/use-cases/anular-pago.use-case';
import { ListarPagosUseCase }           from '../../application/use-cases/listar-pagos.use-case';
import { ResumenFinancieroUseCase }     from '../../application/use-cases/resumen-financiero.use-case';
import {
  CrearConceptoDto, ActualizarConceptoDto,
  ConfigurarTarifaDto, GenerarCuotasDto,
  RegistrarPagoDto, AnularPagoDto,
} from '../../application/dtos/tesoreria.dto';

@ApiTags('Tesorería')
@Auth()
@Controller('tesoreria')
export class TesoreriaController {
  constructor(
    private readonly crearConceptoUC:       CrearConceptoUseCase,
    private readonly listarConceptosUC:     ListarConceptosUseCase,
    private readonly actualizarConceptoUC:  ActualizarConceptoUseCase,
    private readonly configurarTarifaUC:    ConfigurarTarifaUseCase,
    private readonly listarTarifasUC:       ListarTarifasUseCase,
    private readonly eliminarTarifaUC:      EliminarTarifaUseCase,
    private readonly generarCuotasUC:       GenerarCuotasAlumnoUseCase,
    private readonly listarCuotasUC:        ListarCuotasAlumnoUseCase,
    private readonly listarMorosidadUC:     ListarMorosidadUseCase,
    private readonly registrarPagoUC:       RegistrarPagoUseCase,
    private readonly anularPagoUC:          AnularPagoUseCase,
    private readonly listarPagosUC:         ListarPagosUseCase,
    private readonly resumenFinancieroUC:   ResumenFinancieroUseCase,
  ) {}

  // ── Conceptos ──────────────────────────────────────────────────────────────

  @Get('conceptos')
  @ApiOperation({ summary: 'Listar conceptos de pago del colegio' })
  @ApiOkResponse({ schema: { type: 'array', items: { example: CONCEPTO_EXAMPLE } } })
  async listarConceptos(@Request() req: { user: JwtPayload }) {
    return this.listarConceptosUC.execute(req.user.colegioId!);
  }

  @Post('conceptos')
  @ApiOperation({ summary: 'Crear concepto de pago' })
  @ApiCreatedResponse({ schema: { example: CONCEPTO_EXAMPLE } })
  async crearConcepto(@Request() req: { user: JwtPayload }, @Body() dto: CrearConceptoDto) {
    const result = await this.crearConceptoUC.execute({
      colegioId: req.user.colegioId!,
      nombre:    dto.nombre,
      tipo:      dto.tipo as any,
    });
    return (result as any).value;
  }

  @Patch('conceptos/:id')
  @ApiOperation({ summary: 'Actualizar concepto de pago' })
  @ApiOkResponse({ schema: { example: CONCEPTO_EXAMPLE } })
  async actualizarConcepto(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: ActualizarConceptoDto,
  ) {
    const result = await this.actualizarConceptoUC.execute(id, req.user.colegioId!, dto);
    if ((result as any)._tag === 'Fail') throw Object.assign(new Error(), { status: 404, message: (result as any).error.message });
    return (result as any).value;
  }

  // ── Tarifas ────────────────────────────────────────────────────────────────

  @Get('tarifas')
  @ApiOperation({ summary: 'Listar tarifas por año académico' })
  @ApiQuery({ name: 'año', type: Number })
  @ApiOkResponse({ schema: { type: 'array', items: { example: TARIFA_EXAMPLE } } })
  async listarTarifas(@Request() req: { user: JwtPayload }, @Query('año') año: string) {
    if (!año) throw new BadRequestException('El parámetro año es requerido');
    return this.listarTarifasUC.execute(req.user.colegioId!, Number(año));
  }

  @Post('tarifas')
  @ApiOperation({ summary: 'Configurar o actualizar tarifa' })
  @ApiCreatedResponse({ schema: { example: TARIFA_EXAMPLE } })
  async configurarTarifa(@Body() dto: ConfigurarTarifaDto) {
    const result = await this.configurarTarifaUC.execute(dto as any);
    return (result as any).value;
  }

  @Delete('tarifas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar tarifa' })
  @ApiNoContentResponse({ description: 'Tarifa eliminada' })
  async eliminarTarifa(@Param('id') id: string) {
    await this.eliminarTarifaUC.execute(id);
  }

  // ── Cuotas ─────────────────────────────────────────────────────────────────

  @Get('alumnos/:alumnoId/cuotas')
  @ApiOperation({ summary: 'Listar cuotas de un alumno por año' })
  @ApiQuery({ name: 'año', type: Number })
  @ApiOkResponse({ schema: { type: 'array', items: { example: CUOTA_EXAMPLE } } })
  async listarCuotas(@Param('alumnoId') alumnoId: string, @Query('año') año: string) {
    if (!año) throw new BadRequestException('El parámetro año es requerido');
    return this.listarCuotasUC.execute(alumnoId, Number(año));
  }

  @Post('alumnos/:alumnoId/cuotas/generar')
  @ApiOperation({ summary: 'Generar cuotas para un alumno' })
  @ApiCreatedResponse({ schema: { type: 'array', items: { example: CUOTA_EXAMPLE } } })
  async generarCuotas(
    @Request() req: { user: JwtPayload },
    @Param('alumnoId') alumnoId: string,
    @Body() dto: GenerarCuotasDto,
    @Query('colegioNivelId') colegioNivelId: string,
  ) {
    if (!colegioNivelId) throw new BadRequestException('El parámetro colegioNivelId es requerido');
    const result = await this.generarCuotasUC.execute({
      alumnoId,
      colegioId:      req.user.colegioId!,
      colegioNivelId,
      añoAcademico:   dto.añoAcademico,
      mesesPension:   dto.mesesPension,
      diaVencimiento: dto.diaVencimiento,
    });
    return (result as any).value;
  }

  // ── Morosidad ─────────────────────────────────────────────────────────────

  @Get('morosidad')
  @ApiOperation({ summary: 'Reporte de alumnos morosos' })
  @ApiQuery({ name: 'año', type: Number })
  @ApiOkResponse({ schema: { type: 'array', items: { example: MOROSIDAD_EXAMPLE } } })
  async listarMorosidad(@Request() req: { user: JwtPayload }, @Query('año') año: string) {
    if (!año) throw new BadRequestException('El parámetro año es requerido');
    return this.listarMorosidadUC.execute(req.user.colegioId!, Number(año));
  }

  // ── Pagos ──────────────────────────────────────────────────────────────────

  @Get('pagos')
  @ApiOperation({ summary: 'Listar pagos del colegio' })
  @ApiQuery({ name: 'alumnoId', required: false })
  @ApiQuery({ name: 'año',      required: false, type: Number })
  @ApiOkResponse({ schema: { type: 'array', items: { example: PAGO_EXAMPLE } } })
  async listarPagos(
    @Request() req: { user: JwtPayload },
    @Query('alumnoId') alumnoId?: string,
    @Query('año')      año?: string,
  ) {
    return this.listarPagosUC.execute(req.user.colegioId!, {
      alumnoId,
      añoAcademico: año ? Number(año) : undefined,
    });
  }

  @Post('pagos')
  @ApiOperation({ summary: 'Registrar pago (puede cubrir múltiples cuotas)' })
  @ApiCreatedResponse({ schema: { example: PAGO_EXAMPLE } })
  async registrarPago(
    @Request() req: { user: JwtPayload },
    @Body() dto: RegistrarPagoDto,
  ) {
    const result = await this.registrarPagoUC.execute({
      colegioId:       req.user.colegioId!,
      registradoPorId: req.user.sub,
      metodoPago:      dto.metodoPago as any,
      referencia:      dto.referencia,
      observacion:     dto.observacion,
      pagos:           dto.pagos,
    });
    if ((result as any)._tag === 'Fail') {
      const err = (result as any).error;
      throw Object.assign(new Error(), { status: err.type === 'NotFound' ? 404 : 409, message: err.message });
    }
    return (result as any).value;
  }

  @Patch('pagos/:id/anular')
  @ApiOperation({ summary: 'Anular un pago' })
  @ApiOkResponse({ schema: { example: { ...PAGO_EXAMPLE, estado: 'ANULADO' } } })
  async anularPago(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: AnularPagoDto,
  ) {
    const result = await this.anularPagoUC.execute(id, req.user.colegioId!, dto.motivo);
    if ((result as any)._tag === 'Fail') {
      const err = (result as any).error;
      throw Object.assign(new Error(), { status: err.type === 'NotFound' ? 404 : 409, message: err.message });
    }
    return (result as any).value;
  }

  // ── Resumen ────────────────────────────────────────────────────────────────

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen financiero del colegio por año' })
  @ApiQuery({ name: 'año', type: Number })
  @ApiOkResponse({ schema: { example: RESUMEN_EXAMPLE } })
  async resumenFinanciero(@Request() req: { user: JwtPayload }, @Query('año') año: string) {
    if (!año) throw new BadRequestException('El parámetro año es requerido');
    return this.resumenFinancieroUC.execute(req.user.colegioId!, Number(año));
  }
}
