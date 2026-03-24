import { ConceptoPago, TipoConceptoPago } from '../entities/concepto-pago.entity';
import { TarifaConcepto } from '../entities/tarifa-concepto.entity';
import { CuotaAlumno, EstadoCuota } from '../entities/cuota-alumno.entity';
import { Pago, MetodoPago } from '../entities/pago.entity';

export const TESORERIA_REPOSITORY = 'TESORERIA_REPOSITORY';

// ─── Conceptos ────────────────────────────────────────────────────────────────

export interface CrearConceptoProps {
  colegioId: string; nombre: string; tipo: TipoConceptoPago;
}

// ─── Tarifas ──────────────────────────────────────────────────────────────────

export interface ConfigurarTarifaProps {
  conceptoPagoId: string; añoAcademico: number; colegioNivelId?: string; monto: number;
}

// ─── Cuotas ───────────────────────────────────────────────────────────────────

export interface CrearCuotaProps {
  alumnoId: string; conceptoPagoId: string; añoAcademico: number;
  mes?: number | null; descripcion: string; monto: number; fechaVencimiento: Date;
}

// ─── Pagos ────────────────────────────────────────────────────────────────────

export interface CrearPagoProps {
  cuotaId: string; colegioId: string; alumnoId: string; registradoPorId: string;
  monto: number; metodoPago: MetodoPago; referencia?: string; observacion?: string;
}

// ─── Morosidad ────────────────────────────────────────────────────────────────

export interface MorosidadItem {
  alumnoId:         string;
  nombres:          string;
  apellidos:        string;
  codigoMatricula:  string;
  cuotasVencidas:   number;
  montoDeuda:       number;
  cuotaMasAntigua:  Date;
}

export interface TesoreriaRepository {
  // Conceptos
  crearConcepto(props: CrearConceptoProps): Promise<ConceptoPago>;
  listarConceptos(colegioId: string): Promise<ConceptoPago[]>;
  buscarConceptoPorId(id: string): Promise<ConceptoPago | null>;
  actualizarConcepto(id: string, props: Partial<{ nombre: string; activo: boolean }>): Promise<ConceptoPago>;

  // Tarifas
  configurarTarifa(props: ConfigurarTarifaProps): Promise<TarifaConcepto>;
  listarTarifas(colegioId: string, añoAcademico: number): Promise<TarifaConcepto[]>;
  buscarTarifa(conceptoPagoId: string, añoAcademico: number, colegioNivelId?: string): Promise<TarifaConcepto | null>;
  eliminarTarifa(id: string): Promise<void>;

  // Cuotas
  crearCuotas(cuotas: CrearCuotaProps[]): Promise<CuotaAlumno[]>;
  listarCuotasAlumno(alumnoId: string, añoAcademico: number): Promise<CuotaAlumno[]>;
  buscarCuota(id: string): Promise<CuotaAlumno | null>;
  actualizarCuota(id: string, props: Partial<{ montoPagado: number; estado: EstadoCuota }>): Promise<CuotaAlumno>;
  listarMorosidad(colegioId: string, añoAcademico: number, hoy: Date): Promise<MorosidadItem[]>;

  // Pagos
  crearPago(props: CrearPagoProps): Promise<Pago>;
  listarPagos(colegioId: string, filtros: { alumnoId?: string; añoAcademico?: number }): Promise<Pago[]>;
  buscarPago(id: string): Promise<Pago | null>;
  anularPago(id: string, motivo: string): Promise<Pago>;

  // Resumen
  resumenFinanciero(colegioId: string, añoAcademico: number): Promise<{
    totalEsperado: number; totalCobrado: number; totalPendiente: number;
    cuotasPorEstado: Record<EstadoCuota, number>;
  }>;
}
