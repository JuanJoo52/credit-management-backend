import dns from 'node:dns';
import * as nodemailer from 'nodemailer';
import { AppError } from '../errors/app.error';

dns.setDefaultResultOrder('ipv4first');

export const sendPasswordResetEmail = async (to: string, resetLink: string): Promise<void> => {
  // En desarrollo local (si tu ISP bloquea puertos 587/465), imprimimos el link en consola para poder probar
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n==================================================');
    console.log(`[DEV MAILER] Correo simulado para: ${to}`);
    console.log(`[DEV MAILER] Enlace de recuperación:\n${resetLink}`);
    console.log('==================================================\n');
    return;
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new AppError('Error de configuración SMTP: faltan EMAIL_USER o EMAIL_PASS en el entorno', 500);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser.trim(),
      pass: emailPass.replace(/\s+/g, ''),
    },
  });

  try {
    await transporter.sendMail({
      from: `"Soporte Sistema de Créditos" <${emailUser.trim()}>`,
      to,
      subject: 'Recuperación de contraseña - Sistema de Gestión de Créditos',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e293b;">Restablecimiento de Contraseña</h2>
          <p style="color: #475569;">Haz clic en el siguiente botón para crear una nueva contraseña (válido por <strong>15 minutos</strong>):</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Restablecer Contraseña
            </a>
          </div>
        </div>
      `,
    });
  } catch (err: unknown) {
    const detail = err instanceof Error && err.message ? err.message : JSON.stringify(err);
    console.error('[MAILER ERROR]:', detail);
    throw new AppError(`No se pudo enviar el correo de recuperación: ${detail}`, 500);
  }
};