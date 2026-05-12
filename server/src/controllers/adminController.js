import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';
import { toClient, publicUser } from '../utils/transform.js';

// GET /api/admin/stats
export const getStats = asyncHandler(async (_req, res) => {
  const [users, brands, influencers, campaigns, openCampaigns, applications, collaborations, activeCollabs] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'brand' } }),
      prisma.user.count({ where: { role: 'influencer' } }),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'open' } }),
      prisma.application.count(),
      prisma.collaboration.count(),
      prisma.collaboration.count({ where: { status: 'active' } }),
    ]);
  res.json({
    users, brands, influencers, campaigns, openCampaigns,
    applications, collaborations, activeCollabs,
  });
});

// GET /api/admin/users
export const listUsers = asyncHandler(async (req, res) => {
  const { role, status, q } = req.query;
  const where = {};
  if (role) where.role = role;
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }
  const rows = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { handles: true },
  });
  res.json({ items: rows.map(publicUser) });
});

// PATCH /api/admin/users/:id/status
export const setUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    res.status(400);
    throw new Error('Status must be active or suspended');
  }
  const u = await prisma.user.update({
    where: { id: req.params.id },
    data: { status },
    include: { handles: true },
  });
  res.json({ user: publicUser(u) });
});

// GET /api/admin/campaigns
export const listAllCampaigns = asyncHandler(async (req, res) => {
  const { status, q } = req.query;
  const where = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  const rows = await prisma.campaign.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { brand: true },
  });
  res.json({
    items: rows.map((c) => ({
      ...toClient(c),
      brand: c.brand ? { ...toClient(c.brand), password: undefined } : null,
    })),
  });
});

// PATCH /api/admin/campaigns/:id/moderate
export const moderateCampaign = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  const c = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!c) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  let data;
  switch (action) {
    case 'flag':
      data = {
        status: 'flagged',
        flagged: true,
        moderationReason: reason || '',
        reviewedById: req.user.id,
        reviewedAt: new Date(),
      };
      break;
    case 'unflag':
      data = {
        status: 'open',
        flagged: false,
        moderationReason: '',
        reviewedById: req.user.id,
        reviewedAt: new Date(),
      };
      break;
    case 'close':
      data = { status: 'closed' };
      break;
    default:
      res.status(400);
      throw new Error('Unknown moderation action');
  }
  const updated = await prisma.campaign.update({ where: { id: c.id }, data });
  res.json({ campaign: toClient(updated) });
});
