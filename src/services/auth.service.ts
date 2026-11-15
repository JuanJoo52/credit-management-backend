import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/app.error';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '../utils/mailer';
import { LoginDto, AuthResponse } from '../types/auth.types';

const prisma = new PrismaClient();

export const loginService = async (credentials: any) => {
  const { email, password } = credentials;
  if (!email || typeof email !== 'string') {
    throw new AppError('Credenciales inválidas', 401);
  }
  // 1. Buscamos al usuario por el correo (normalizado a minúsculas)
  const emailNormalizado = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: emailNormalizado }
  });
  // Nunca le decimos al cliente "El correo no existe" o "La clave es incorrecta"  si no Credenciales inválidas" 
  if (!user) {
    throw new AppError('Credenciales inválidas', 401);
  }

  //  Comparamos la contraseña en texto plano contra el hash de la base de datos
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Credenciales inválidas');
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError('Usuario inactivo. Acceso denegado.', 401);
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('Error crítico del servidor: JWT_SECRET no está definido');
  }

  //Fabricamos el Token (JWT). 
  // En el payload metemos el ID y el ROL. 
  // El ROL es vital meterlo aquí, porque es lo que usaremos después para bloquear el HU-01 a solo ADMINS.
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' } // El token se vence en 2 horas por seguridad
  );

  //  Retornamos el token y los datos del usuario (pero le mochamos la contraseña)
  const { passwordHash, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword
  };
};
export const forgotPasswordService = async (email: string) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new AppError('El correo electrónico es obligatorio', 400);
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('Error crítico del servidor: JWT_SECRET no está definido');
  }

  const emailNormalizado = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: emailNormalizado },
  });

  // Respuesta genérica para no revelar si el correo existe (misma filosofía de tu loginService)
  const genericResponse = {
    message: 'Si el correo se encuentra registrado, recibirás un enlace para restablecer tu contraseña.',
  };

  // Si no existe o está INACTIVE, respondemos genérico sin enviar correo
  if (!user || user.status !== 'ACTIVE') {
    return genericResponse;
  }

  // Secreto dinámico: al cambiar passwordHash en BD, este token queda invalidado automáticamente
  const dynamicSecret = `${process.env.JWT_SECRET}_${user.passwordHash}`;
  const resetToken = jwt.sign(
    {
      userId: user.id,
      purpose: 'PASSWORD_RESET',
    },
    dynamicSecret,
    { expiresIn: '15m' }
  );

  const frontendUrl = process.env.CORS_ORIGINS || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  // await obligatorio para garantizar el envío en Vercel Serverless
  await sendPasswordResetEmail(user.email, resetLink);

  return genericResponse;
};

export const resetPasswordService = async (token: string, newPassword: string) => {
  if (!token || typeof token !== 'string' || !newPassword || typeof newPassword !== 'string') {
    throw new AppError('El token y la nueva contraseña son obligatorios', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('La nueva contraseña debe tener al menos 8 caracteres', 400);
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('Error crítico del servidor: JWT_SECRET no está definido');
  }

  // 1. Extraemos userId sin verificar firma aún para consultar el passwordHash actual
  const decoded = jwt.decode(token) as { userId?: number; purpose?: string } | null;
  if (!decoded || !decoded.userId || decoded.purpose !== 'PASSWORD_RESET') {
    throw new AppError('El enlace de recuperación no es válido', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(decoded.userId) },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new AppError('El enlace de recuperación no es válido', 400);
  }

  // 2. Verificamos firma y expiración (15m) contra el secreto dinámico actual
  const dynamicSecret = `${process.env.JWT_SECRET}_${user.passwordHash}`;
  try {
    jwt.verify(token, dynamicSecret);
  } catch {
    throw new AppError('El enlace de recuperación ha expirado o ya fue utilizado', 400);
  }

  // 3. Encriptamos y actualizamos passwordHash (invalida el token de inmediato)
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashedPassword },
  });

  return {
    message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.',
  };
};