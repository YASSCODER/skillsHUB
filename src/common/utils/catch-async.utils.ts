import { Request, Response, NextFunction } from 'express';

// Cette fonction enveloppe les gestionnaires de route async pour gérer les erreurs
const catchAsync = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
