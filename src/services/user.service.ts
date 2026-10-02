import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../errors/app.error';

const prisma = new PrismaClient();

export const createUserService = async (userData: any) => {
    const { email, password, name, role } = userData;
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new AppError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',400);
    }
    // verificamos que el correo no esté repetido en la bd
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new AppError('User already exists with this email',409);
    }

    // toca hashear la contraseña, ni a palo guardarla en texto plano
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // creamos el registro mapeando los campos tal cual los pide el schema
    const newUser = await prisma.user.create({
        data: {
            email,
            name,
            passwordHash: hashedPassword,
            role: role,
        }
    });

    // le volamos el passwordHash al objeto antes de mandarlo al front por seguridad
    const { passwordHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

interface UpdateUserData {
  name?: string;
  role?: any;
  status?: string;
}
export const updateUserService = async (
  targetUserId: string,
  currentAdminId: number,
  updateData: UpdateUserData
) => {
  const numericUserId = parseInt(targetUserId, 10);
  if (isNaN(numericUserId)) {
    throw new AppError('El ID proporcionado debe ser un número válido', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: numericUserId }
  });

  if (!user) {
    throw new AppError('El empleado no existe', 404);
  }

  // Evitar que el admin se inactive a sí mismo
  if (numericUserId === currentAdminId && updateData.status === 'INACTIVE') {
    throw new AppError('Un administrador no puede desactivar su propia cuenta', 400);
  }

  if (updateData.name !== undefined && updateData.name.trim() === '') {
    throw new AppError('El nombre no puede estar vacío', 400);
  }

  const allowedRoles = ['ADMIN', 'ADVISOR', 'CASHIER'];
  if (updateData.role !== undefined && !allowedRoles.includes(updateData.role)) {
    throw new AppError(`Rol inválido. Roles permitidos: ${allowedRoles.join(', ')}`, 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id: numericUserId },
    data: {
      ...(updateData.name && { name: updateData.name.trim() }),
      ...(updateData.role && { role: updateData.role }),
      ...(updateData.status && { status: updateData.status })
    }
  });

  const { passwordHash, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};