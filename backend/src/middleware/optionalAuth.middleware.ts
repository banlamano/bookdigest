import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Optional authentication middleware:
// - If token is present and valid => sets req.user
// - If token missing => continues without req.user
// - If token invalid => continues without req.user (treat as logged out)
export const optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    return next();
  } catch {
    // treat as unauthenticated
    return next();
  }
};
