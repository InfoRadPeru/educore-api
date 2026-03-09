// Qué es: Error de dominio específico para límites de plan.
// Patrón: Domain Error — extiende AppError sin conocer HTTP.
// El HttpExceptionFilter lo convierte a 403.
// Por qué separado: Este error tiene datos extra (limiteActual, usoActual, planSugerido)
// que el filtro global necesita para construir la respuesta enriquecida.

import { AppError } from '@shared/domain/result';

export class PlanLimitError extends AppError {
  constructor(
    public readonly limiteActual:  number,
    public readonly usoActual:     number,
    public readonly recurso:       string,
    public readonly planSugerido:  string | null,
  ) {
    super(
      'PLAN_LIMIT_EXCEEDED',
      `Tu plan no permite más ${recurso}. Límite: ${limiteActual}, En uso: ${usoActual}.${planSugerido ? ` Considera actualizar al plan ${planSugerido}.` : ''}`,
    );
  }
}