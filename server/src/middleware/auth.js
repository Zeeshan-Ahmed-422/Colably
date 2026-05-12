import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token');
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error('Not authorized — invalid token');
  }
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: { handles: true },
  });
  if (!user) {
    res.status(401);
    throw new Error('Not authorized — user not found');
  }
  if (user.status === 'suspended') {
    res.status(403);
    throw new Error('Account suspended');
  }
  req.user = user;
  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error(`Forbidden — requires role: ${roles.join('/')}`));
  }
  next();
};
