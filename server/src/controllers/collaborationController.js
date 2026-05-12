import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';
import { toClient, publicUser } from '../utils/transform.js';

const COLLAB_INCLUDE = {
  campaign: { select: { id: true, title: true, status: true, platforms: true, niches: true, budget: true } },
  brand: { include: { handles: true } },
  influencer: { include: { handles: true } },
};

function shapeCollab(c) {
  return {
    ...toClient(c),
    campaign: c.campaign ? toClient(c.campaign) : null,
    brand: c.brand ? publicUser(c.brand) : null,
    influencer: c.influencer ? publicUser(c.influencer) : null,
  };
}

// GET /api/collaborations
export const myCollaborations = asyncHandler(async (req, res) => {
  const where =
    req.user.role === 'brand' ? { brandId: req.user.id } :
    req.user.role === 'influencer' ? { influencerId: req.user.id } :
    {};
  const rows = await prisma.collaboration.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: COLLAB_INCLUDE,
  });
  res.json({ items: rows.map(shapeCollab) });
});

// GET /api/collaborations/:id
export const getCollaboration = asyncHandler(async (req, res) => {
  const c = await prisma.collaboration.findUnique({
    where: { id: req.params.id },
    include: {
      campaign: true,
      brand: { include: { handles: true } },
      influencer: { include: { handles: true } },
    },
  });
  if (!c) {
    res.status(404);
    throw new Error('Collaboration not found');
  }
  if (c.brandId !== req.user.id && c.influencerId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not a participant');
  }
  const deliverables = await prisma.deliverable.findMany({
    where: { collaborationId: c.id },
    orderBy: { createdAt: 'asc' },
  });
  res.json({
    collaboration: shapeCollab(c),
    deliverables: deliverables.map(toClient),
  });
});

// PATCH /api/collaborations/:id/complete
export const completeCollaboration = asyncHandler(async (req, res) => {
  const c = await prisma.collaboration.findUnique({ where: { id: req.params.id } });
  if (!c) {
    res.status(404);
    throw new Error('Collaboration not found');
  }
  if (c.brandId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only the brand can mark a collaboration complete');
  }
  const updated = await prisma.collaboration.update({
    where: { id: c.id },
    data: {
      status: 'completed',
      completionNotes: req.body.completionNotes || '',
      completedAt: new Date(),
    },
  });
  res.json({ collaboration: toClient(updated) });
});

// PATCH /api/collaborations/:id/cancel
export const cancelCollaboration = asyncHandler(async (req, res) => {
  const c = await prisma.collaboration.findUnique({ where: { id: req.params.id } });
  if (!c) {
    res.status(404);
    throw new Error('Collaboration not found');
  }
  if (c.brandId !== req.user.id && c.influencerId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not a participant');
  }
  const updated = await prisma.collaboration.update({
    where: { id: c.id },
    data: { status: 'cancelled' },
  });
  res.json({ collaboration: toClient(updated) });
});
