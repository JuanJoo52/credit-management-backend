import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const createUserService = async (userData: any) => {
    const { email, password, name, role } = userData;
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número');
    }
    // verificamos que el correo no esté repetido en la bd
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error('User already exists with this email');
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