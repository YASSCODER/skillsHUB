import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Vérifier si la stratégie JWT est disponible
  if (!passport._strategies.jwt) {
    console.error("Stratégie JWT non initialisée");
    return res.status(500).json({ message: "Erreur de configuration d'authentification" });
  }
  
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: Authentication required' });
    }
    
    req.user = user;
    return next();
  })(req, res, next);
};

