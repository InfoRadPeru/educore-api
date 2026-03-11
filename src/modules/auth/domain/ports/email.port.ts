// Qué es: Contrato para el servicio de email.
// Patrón: Port/Adapter — el use case depende de este contrato, no de Nodemailer.
// Principio SOLID: Dependency Inversion — Domain define qué necesita,
// Infrastructure decide cómo lo hace.

export const EMAIL_PORT = 'EmailPort';

export interface EnviarRecuperacionProps {
  destinatario: string;
  nombres:      string;
  token:        string;
}

export interface EmailPort {
  enviarRecuperacionPassword(props: EnviarRecuperacionProps): Promise<void>;
}