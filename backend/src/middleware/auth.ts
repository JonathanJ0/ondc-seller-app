import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'qLz6FXT1lKr1m0XeYu9W7oZzqxL6xby1gK8GzBqe8AqzN0vXxT3uAeqW0WrRFaUz');
    const user = await User.findOne({ where: { id: (decoded as any).id } });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export const generateToken = (userId: number): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'qLz6FXT1lKr1m0XeYu9W7oZzqxL6xby1gK8GzBqe8AqzN0vXxT3uAeqW0WrRFaUz',
    { expiresIn: '24h' }
  );
}; 