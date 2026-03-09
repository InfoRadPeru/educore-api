// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Contrato del repositorio de Niveles académicos del colegio.
//
// CONTEXTO DE DOMINIO:
//   Un Nivel en este sistema es la activación de un NivelMaestro
//   (catálogo global) por parte de un colegio específico.
//   El catálogo lo gestiona PLATFORM_ADMIN.
//   La activación por colegio la gestiona SUPER_ADMIN.
//
// POR QUÉ buscarTodos DEVUELVE TAMBIÉN LOS NO ACTIVADOS:
//   El SUPER_ADMIN necesita ver todos los niveles disponibles
//   para poder activarlos. El repositorio devuelve el estado
//   completo — activos e inactivos — y el use case decide cómo
//   presentarlos.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Nivel } from '../entities/nivel.entity';

export const NIVEL_REPOSITORY = 'NivelRepository';

export interface NivelRepository {
  // Devuelve todos los niveles del catálogo con su estado de activación para el colegio
  buscarTodos(colegioId: string):                                        Promise<Nivel[]>;
  // Busca un nivel específico ya activado por el colegio
  buscarPorNivelMaestro(nivelMaestroId: string, colegioId: string):     Promise<Nivel | null>;
  // Primera activación — crea el registro ColegioNivel
  activar(colegioId: string, nivelMaestroId: string):                   Promise<Nivel>;
  // Cambia activo/inactivo en un nivel ya existente
  cambiarEstado(nivelId: string, activo: boolean):                      Promise<Nivel>;
}