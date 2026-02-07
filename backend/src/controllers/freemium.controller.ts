import { Request, Response, NextFunction } from 'express';
import { getFreemiumStatus } from '../middleware/freemium.middleware';

// Get freemium status for the current user
export const getFreemiumStatusController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const status = await getFreemiumStatus(userId);

    res.json({
      status: 'success',
      data: status,
    });
  } catch (error) {
    next(error);
  }
};
