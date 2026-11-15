
import { DocumentType } from '@prisma/client';
import { AppError } from '../errors/app.error';

export const validateDocumentNumber = (
    documentType: DocumentType,
    documentNumber: string
): string => {
    const cleanDoc = documentNumber.trim().toUpperCase();

    if (documentType === DocumentType.PASSPORT) {
        // Pasaporte: Alfanumérico (letras y números), entre 6 y 12 caracteres, sin signos ni guiones
        const passportRegex = /^[A-Z0-9]{6,12}$/;
        if (!passportRegex.test(cleanDoc)) {
            throw new AppError(
                'El pasaporte debe contener entre 6 y 12 caracteres alfanuméricos (solo letras y números)',
                400
            );
        }
    } else {
        // CC o CE: Estrictamente dígitos numéricos entre 6 y 10 caracteres
        const numericDocRegex = /^[0-9]{6,10}$/;
        if (!numericDocRegex.test(cleanDoc)) {
            throw new AppError(
                'El número de documento debe contener únicamente entre 6 y 10 dígitos numéricos',
                400
            );
        }
    }

    return cleanDoc;
};
export const validateDocumentParam = (documentNumber: string): string => {
    if (!documentNumber || !documentNumber.trim()) {
        throw new AppError('El número de documento es obligatorio', 400);
    }

    const cleanDoc = documentNumber.trim().toUpperCase();
    const validParamRegex = /^([0-9]{6,10}|[A-Z0-9]{6,12})$/;

    if (!validParamRegex.test(cleanDoc)) {
        throw new AppError(
            'El formato del documento en la URL no es válido (debe ser numérico de 6-10 dígitos o alfanumérico de 6-12 caracteres)',
            400
        );
    }

    return cleanDoc;
};