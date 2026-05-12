import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';
import { toClient, publicUser } from '../utils/transform.js';

// POST /api/applications  (influencer applies)
export const apply = asyncHandler(async (req, res) => {
  const { campaignId, message, proposedRate } = req.body;
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }
  if (campaign.status !== 'open') {
    res.status(400);
    throw new Error('Campaign is not open for applications');
  }
  const exists = await prisma.application.findUnique({
    where: { campaignId_influencerId: { campaignId, influencerId: req.user.id } },
  });
  if (exists) {
    res.status(409);
    throw new Error('You already applied to this campaign');
  }
  const app = await prisma.application.create({
    data: {
      campaignId,
      influencerId: req.user.id,
      brandId: campaign.brandId,
      kind: 'application',
      status: 'pending',
      message: message || '',
      proposedRate: proposedRate != null ? Number(proposedRate) : null,
    },
  });
  res.status(201).json({ application: toClient(app) });
});

// POST /api/applications/invite  (brand invites)
export const invite = asyncHandler(async (req, res) => {
  const { campaignId, influencerId, message, proposedRate } = req.body;
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }
  if (campaign.brandId !== req.user.id) {
    res.status(403);
    throw new Error('Not your campaign');
  }
  const exists = await prisma.application.findUnique({
    where: { campaignId_influencerId: { campaignId, influencerId } },
  });
  if (exists) {
    res.status(409);
    throw new Error('An application/invitation already exists for this influencer');
  }
  const app = await prisma.application.create({
    data: {
      campaignId,
      influencerId,
      brandId: req.user.id,
      kind: 'invitation',
      status: 'invited',
      message: message || '',
      proposedRate: proposedRate != null ? Number(proposedRate) : null,
    },
  });
  res.status(201).json({ application: toClient(app) });
});

const APP_INCLUDE = {
  campaign: { select: { id: true, title: true, status: true, budget: true, platforms: true, niches: true } },
  influencer: { include: { handles: true } },
  brand: { include: { handles: true } },
};

function shapeApplication(a) {
  return {
    ...toClient(a),
    campaign: a.campaign ? toClient(a.campaign) : null,
    influencer: a.influencer ? publicUser(a.influencer) : null,
    brand: a.brand ? publicUser(a.brand) : null,
  };
}

// GET /api/applications/mine
export const myApplications = asyncHandler(async (req, res) => {
  const where = req.user.role === 'brand'
    ? { brandId: req.user.id }
    : { influencerId: req.user.id };
  const rows = await prisma.application.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: APP_INCLUDE,
  });
  res.json({ items: rows.map(shapeApplication) });
});

// GET /api/applications/campaign/:id  (brand)
export const applicationsForCampaign = asyncHandler(async (req, res) => {
  const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }
  if (campaign.brandId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not your campaign');
  }
  const rows = await prisma.application.findMany({
    where: { campaignId: campaign.id },
    orderBy: { createdAt: 'desc' },
    include: { influencer: { include: { handles: true } } },
  });
  res.json({
    items: rows.map((a) => ({
      ...toClient(a),
      influencer: publicUser(a.influencer),
    })),
  });
});

// PATCH /api/applications/:id/status
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status: nextStatus, agreedRate } = req.body;
  const app = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: { campaign: true },
  });
  if (!app) {
    res.status(404);
    throw new Error('Application not found');
  }
  const isBrand = req.user.id === app.brandId;
  const isInfluencer = req.user.id === app.influencerId;
  if (!isBrand && !isInfluencer && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not your application');
  }

  const brandAllowed = ['shortlisted', 'rejected', 'accepted'];
  const influencerAllowed = ['accepted', 'declined', 'withdrawn'];

  if (isBrand && !brandAllowed.includes(nextStatus)) {
    res.status(400);
    throw new Error('Invalid status transition for brand');
  }
  if (isInfluencer && !influencerAllowed.includes(nextStatus)) {
    res.status(400);
    throw new Error('Invalid status transition for influencer');
  }

  const updated = await prisma.application.update({
    where: { id: app.id },
    data: { status: nextStatus },
  });

  // When accepted, create the collaboration (idempotent on (campaignId, influencerId))
  let collaboration = null;
  if (nextStatus === 'accepted') {
    collaboration = await prisma.collaboration.upsert({
      where: {
        campaignId_influencerId: { campaignId: app.campaignId, influencerId: app.influencerId },
      },
      update: {},
      create: {
        campaignId: app.campaignId,
        brandId: app.brandId,
        influencerId: app.influencerId,
        applicationId: app.id,
        agreedRate: agreedRate != null
          ? Number(agreedRate)
          : (app.proposedRate ?? null),
        status: 'active',
      },
    });

    // Seed deliverables from the campaign template if none exist yet
    const dCount = await prisma.deliverable.count({ where: { collaborationId: collaboration.id } });
    if (dCount === 0 && app.campaign.deliverablesTemplate?.length) {
      await prisma.deliverable.createMany({
        data: app.campaign.deliverablesTemplate.map((title) => ({
          collaborationId: collaboration.id,
          title,
          status: 'todo',
        })),
      });
    }
  }

  res.json({ application: toClient(updated), collaboration: toClient(collaboration) });
});
