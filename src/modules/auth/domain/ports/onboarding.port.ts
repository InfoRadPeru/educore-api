// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUÉ ES:
//   Puerto de salida (Output Port) para el flujo de onboarding.
//
// POR QUÉ "PUERTO" Y NO "REPOSITORIO":
//   Un Repository representa un agregado de dominio (Colegio, Usuario...).
//   Un Port representa una capacidad que el módulo Auth necesita de afuera
//   pero que no le pertenece. Auth no es dueño del Colegio — solo necesita
//   poder crear uno durante el registro.
//
// PATRÓN: Ports & Adapters (Hexagonal Architecture).
//   - Port: contrato definido por quien lo necesita (Auth).
//   - Adapter: implementación provista por quien lo cumple (Colegios).
//   Auth depende de la abstracción, nunca de la implementación concreta.
//
// PRINCIPIO SOLID: Dependency Inversion.
//   Auth define QUÉ necesita. Colegios decide CÓMO hacerlo.
//   Si mañana el proceso de onboarding cambia (eventos, saga, etc.),
//   solo cambia el Adapter — Auth no se toca.
//
// POR QUÉ SE LLAMA "ONBOARDING" Y NO "COLEGIO":
//   El nombre refleja la intención del uso, no el objeto que manipula.
//   Registrar un nuevo colegio con su admin es el proceso de onboarding.
//   Esto evita la colisión con el token 'ColegioRepository' del módulo Colegios.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Asignacion } from '../entities/asignacion.entity';

// Token de inyección — string único, sin colisión posible
export const ONBOARDING_PORT = 'OnboardingPort';

// Props que Auth necesita enviar para crear el colegio inicial
// Solo los datos mínimos — Auth no conoce el modelo completo de Colegio
export interface CrearColegioInicialProps {
  nombre:    string;
  ruc:       string;
  direccion: string;
  email:     string;
  usuarioId: string;
}

// Resultado que Auth necesita recibir para generar el JWT
// Solo lo estrictamente necesario — no toda la entidad Colegio
export interface ColegioInicialCreadoResult {
  colegioId:  string;
  asignacion: Asignacion;
}

export interface OnboardingPort {
  // Verifica si ya existe un colegio con ese RUC antes de registrar
  existeColegioConRuc(ruc: string): Promise<boolean>;

  // Crea el colegio + rol SUPER_ADMIN + asignación en una sola transacción
  // Es atómico: si falla cualquier paso, no queda nada creado a medias
  crearColegioConSuperAdmin(props: CrearColegioInicialProps): Promise<ColegioInicialCreadoResult>;
}