
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