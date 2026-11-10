import { Request, Response, NextFunction } from 'express';

export const jsonErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'El cuerpo de la petición (JSON) está malformado o es inválido',
    });
  }
  next(err);
};