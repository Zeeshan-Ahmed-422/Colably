import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';
import { publicUser } from '../utils/transform.js';

const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin'];
const NICHES = [
  'fashion', 'beauty', 'fitness', 'food', 'travel', 'tech',
  'gaming', 'finance', 'education', 'lifestyle', 'parenting', 'comedy',
];

export const getEnums = (_req, res) => {
  res.json({ platforms: PLATFORMS, niches: NICHES });
};

export const getMyProfile = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// Recompute totalFollowers from a list of handles.
function sumFollowers(handles = []) {
  return handles.reduce((s, h) => s + (Number(h.followers) || 0), 0);
}

export const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, avatarUrl, brandProfile, influencerProfile } = req.body;
  const userId = req.user.id;

  const data = {};
  if (name !== undefined) data.name = name;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

  if (req.user.role === 'brand' && brandProfile) {
    if (brandProfile.companyName !== undefined) data.companyName = brandProfile.companyName;
    if (brandProfile.website !== undefined) data.website = brandProfile.website;
    if (brandProfile.industry !== undefined) data.industry = brandProfile.industry;
    if (brandProfile.description !== undefined) data.description = brandProfile.description;
  }

  if (req.user.role === 'influencer' && influencerProfile) {
    if (influencerProfile.bio !== undefined) data.bio = influencerProfile.bio;
    if (influencerProfile.location !== undefined) data.location = influencerProfile.location;
    if (influencerProfile.niches !== undefined) data.niches = influencerProfile.niches;
    // Replace handles wholesale if provided
    if (Array.isArray(influencerProfile.handles)) {
      // Run as a transaction so handle replacement + totalFollowers recompute stay consistent
      await prisma.$transaction([
        prisma.socialHandle.deleteMany({ where: { userId } }),
        prisma.socialHandle.createMany({
          data: influencerProfile.handles.map((h) => ({
            userId,
            platform: h.platform,
            handle: h.handle,
            followers: Number(h.followers) || 0,
            engagementRate: Number(h.engagementRate) || 0,
          })),
        }),
      ]);
      data.totalFollowers = sumFollowers(influencerProfile.handles);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: { handles: true },
  });
  res.json({ user: publicUser(user) });
});

// GET /api/users/influencers?niche=&platform=&minFollowers=&maxFollowers=&q=&page=&limit=
export const searchInfluencers = asyncHandler(async (req, res) => {
  const { niche, platform, minFollowers, maxFollowers, q, page = 1, limit = 12 } = req.query;
  const where = { role: 'influencer', status: 'active' };

  if (niche) where.niches = { has: niche };
  if (platform) where.handles = { some: { platform } };
  if (minFollowers || maxFollowers) {
    where.totalFollowers = {};
    if (minFollowers) where.totalFollowers.gte = Number(minFollowers);
    if (maxFollowers) where.totalFollowers.lte = Number(maxFollowers);
  }
  if (q) where.name = { contains: q, mode: 'insensitive' };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { totalFollowers: 'desc' },
      skip,
      take: Number(limit),
      include: { handles: true },
    }),
    prisma.user.count({ where }),
  ]);
  res.json({
    items: items.map(publicUser),
    total,
    page: Number(page),
    limit: Number(limit),
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { handles: true },
  });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ user: publicUser(user) });
});
