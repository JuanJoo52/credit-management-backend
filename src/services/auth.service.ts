import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const loginService = async (credentials: any) => {
  const { email, password } = credentials;

  // 1. Buscamos al usuario por el correo
  const user = await prisma.user.findUnique({
    where: { email }
  });

  // Nunca le decimos al cliente "El correo no existe" o "La clave es incorrecta"  si no Credenciales inválidas" 
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  //  Comparamos la contraseña en texto plano contra el hash de la base de datos
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Credenciales inválidas');
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