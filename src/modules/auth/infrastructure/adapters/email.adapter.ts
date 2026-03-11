// Qué es: Implementación concreta del EmailPort usando Nodemailer.
// Patrón: Port/Adapter — esta clase es el Adapter. EmailPort es el Port.
// Por qué Ethereal en desarrollo: Es un servicio de prueba que captura emails
// sin enviarlos realmente. Puedes ver el email en una URL que Nodemailer imprime
// en consola. Cero configuración real necesaria.
// En producción: cambia las credenciales por las de tu SMTP real (Gmail, SES, etc)
// sin tocar el use case ni el port.

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailPort, EnviarRecuperacionProps } from '@modules/auth/domain/ports/email.port';

@Injectable()
export class EmailAdapter implements EmailPort {
  private readonly logger = new Logger(EmailAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async enviarRecuperacionPassword(props: EnviarRecuperacionProps): Promise<void> {
    const transporter = await this.crearTransporter();

    const resetUrl = `${this.config.get('FRONTEND_URL')}/reset-password?token=${props.token}`;

    const info = await transporter.sendMail({
      from:    `"EduCore" <no-reply@educore.pe>`,
      to:      props.destinatario,
      subject: 'Recupera tu contraseña — EduCore',
      html:    this.buildTemplate(props.nombres, resetUrl),
    });

    // En desarrollo, Nodemailer imprime la URL donde puedes ver el email
    this.logger.log(`Email enviado: ${nodemailer.getTestMessageUrl(info)}`);
  }

  private async crearTransporter() {
    const smtpHost = this.config.get('SMTP_HOST');

    // Si no hay configuración SMTP, usa Ethereal (solo desarrollo)
    if (!smtpHost) {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host:   'smtp.ethereal.email',
        port:   587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Producción — usa las variables de entorno
    return nodemailer.createTransport({
      host:   smtpHost,
      port:   this.config.get<number>('SMTP_PORT') ?? 587,
      secure: this.config.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  private buildTemplate(nombres: string, resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola, ${nombres}</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace — expira en 1 hora:</p>
        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #1a73e8;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        ">
          Restablecer contraseña
        </a>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
      </div>
    `;
  }
}