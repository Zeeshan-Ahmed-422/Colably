import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';
import { toClient, publicUser } from '../utils/transform.js';

// POST /api/campaigns  (brand)
export const createCampaign = asyncHandler(async (req, res) => {
  const {
    title, description, budget, currency, platforms, niches,
    minFollowers, deliverablesTemplate, deadline,
  } = req.body;
  const c = await prisma.campaign.create({
    data: {
      brandId: req.user.id,
      title,
      description,
      budget: Number(budget),
      currency: currency || 'USD',
      platforms: platforms || [],
      niches: niches || [],
      minFollowers: Number(minFollowers) || 0,
      deliverablesTemplate: deliverablesTemplate || [],
      deadline: deadline ? new Date(deadline) : null,
    },
  });
  res.status(201).json({ campaign: toClient(c) });
});

// GET /api/campaigns?platform=&niche=&minBudget=&maxBudget=&q=&status=&mine=
export const listCampaigns = asyncHandler(async (req, res) => {
  const {
    platform, niche, minBudget, maxBudget, q, status,
    page = 1, limit = 12, mine,
  } = req.query;

  const where = {};
  if (mine === 'true') where.brandId = req.user.id;
  else if (status) where.status = status;
  else where.status = 'open';

  if (platform) where.platforms = { has: platform };
  if (niche) where.niches = { has: niche };
  if (minBudget || maxBudget) {
    where.budget = {};
    if (minBudget) where.budget.gte = Number(minBudget);
    if (maxBudget) where.budget.lte = Number(maxBudget);
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [rows, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
      include: { brand: { include: { handles: true } } },
    }),
    prisma.campaign.count({ where }),
  ]);

  res.json({
    items: rows.map((c) => ({
      ...toClient(c),
      brand: publicUser(c.brand),
    })),
    total,
    page: Number(page),
    limit: Number(limit),
  });
});

// GET /api/campaigns/:id
export const getCampaign = asyncHandler(async (req, res) => {
  const c = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: { brand: { include: { handles: true } } },
  });
  if (!c) {
    res.status(404);
    throw new Error('Campaign not found');
  }
  let myApplication = null;
  if (req.user.role === 'influencer') {
    myApplication = await prisma.application.findUnique({
      where: { campaignId_influencerId: { campaignId: c.id, influencerId: req.user.id } },
    });
  }
  res.json({
    campaign: { ...toClient(c), brand: publicUser(c.brand) },
    myApplication: toClient(myApplication),
  });
});

// PUT /api/campaigns/:id
export const updateCampaign = asyncHandler(async (req, res) => {
  const c = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!c) {
    res.status(404);
    throw new Error('Campaign not found');
  }
  if (c.brandId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not your campaign');
  }
  const allowed = [
    'title', 'description', 'budget', 'currency', 'platforms', 'niches',
    'minFollowers', 'deliverablesTemplate', 'deadline', 'status',
  ];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  if (data.deadline) data.deadline = new Date(data.deadline);
  if (data.budget !== undefined) data.budget = Number(data.budget);
  if (data.minFollowers !== undefined) data.minFollowers = Number(data.minFollowers);

  const updated = await prisma.campaign.update({ where: { id: c.id }, data });
  res.json({ campaign: toClient(updated) });
});

// DELETE /api/campaigns/:id
export const deleteCampaign = asyncHandler(async (req, res) => {
  const c = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!c) {
    res.status(404);
    throw new Error('Campaign not found');
  }
  if (c.brandId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not your campaign');
  }
  await prisma.campaign.delete({ where: { id: c.id } });
  res.json({ ok: true });
});
