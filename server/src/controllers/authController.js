import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { signToken } from '../utils/token.js';
import { publicUser } from '../utils/transform.js';

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, brandProfile, influencerProfile } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Missing required fields');
  }
  if (!['brand', 'influencer'].includes(role)) {
    res.status(400);
    throw new Error('Role must be brand or influencer');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    res.status(409);
    throw new Error('Email already registered');
  }

  const hash = await bcrypt.hash(password, 10);
  const data = {
    name,
    email: email.toLowerCase(),
    password: hash,
    role,
    ...(role === 'brand' && brandProfile
      ? {
          companyName: brandProfile.companyName ?? null,
          website: brandProfile.website ?? null,
          industry: brandProfile.industry ?? null,
          description: brandProfile.description ?? null,
        }
      : {}),
    ...(role === 'influencer' && influencerProfile
      ? {
          bio: influencerProfile.bio ?? null,
          location: influencerProfile.location ?? null,
          niches: influencerProfile.niches || [],
        }
      : {}),
  };

  const user = await prisma.user.create({
    data,
    include: { handles: true },
  });

  res.status(201).json({
    user: publicUser(user),
    token: signToken(user.id),
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email: (email || '').toLowerCase() },
    include: { handles: true },
  });
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (user.status === 'suspended') {
    res.status(403);
    throw new Error('Account suspended');
  }
  res.json({ user: publicUser(user), token: signToken(user.id) });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
