import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';
import { toClient } from '../utils/transform.js';

async function assertParticipant(req, collaborationId) {
  const collab = await prisma.collaboration.findUnique({ where: { id: collaborationId } });
  if (!collab) {
    const err = new Error('Collaboration not found');
    err.status = 404;
    throw err;
  }
  const isParticipant =
    collab.brandId === req.user.id ||
    collab.influencerId === req.user.id ||
    req.user.role === 'admin';
  if (!isParticipant) {
    const err = new Error('Not a participant');
    err.status = 403;
    throw err;
  }
  return collab;
}

// POST /api/deliverables  (brand adds)
export const createDeliverable = asyncHandler(async (req, res) => {
  const { collaborationId, title, description, dueDate } = req.body;
  const collab = await assertParticipant(req, collaborationId);
  if (collab.brandId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only the brand can add deliverables');
  }
  const d = await prisma.deliverable.create({
    data: {
      collaborationId: collab.id,
      title,
      description: description || '',
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  res.status(201).json({ deliverable: toClient(d) });
});

// GET /api/deliverables/by-collaboration/:id
export const listDeliverables = asyncHandler(async (req, res) => {
  const collab = await assertParticipant(req, req.params.id);
  const items = await prisma.deliverable.findMany({
    where: { collaborationId: collab.id },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ items: items.map(toClient) });
});

// PATCH /api/deliverables/:id
export const updateDeliverable = asyncHandler(async (req, res) => {
  const existing = await prisma.deliverable.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404);
    throw new Error('Deliverable not found');
  }
  const collab = await assertParticipant(req, existing.collaborationId);
  const isBrand = collab.brandId === req.user.id;
  const isInfluencer = collab.influencerId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  const {
    status: nextStatus, proofUrl, submissionNote, feedback,
    title, description, dueDate,
  } = req.body;

  const data = {};

  // Permission matrix
  if (isInfluencer) {
    if (proofUrl !== undefined) data.proofUrl = proofUrl;
    if (submissionNote !== undefined) data.submissionNote = submissionNote;
    if (nextStatus && ['in_progress', 'submitted'].includes(nextStatus)) {
      data.status = nextStatus;
      if (nextStatus === 'submitted') data.submittedAt = new Date();
    } else if (nextStatus) {
      res.status(400);
      throw new Error('Influencer can only set in_progress or submitted');
    }
  }
  if (isBrand || isAdmin) {
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (feedback !== undefined) data.feedback = feedback;
    if (nextStatus && ['todo', 'approved', 'rejected'].includes(nextStatus)) {
      data.status = nextStatus;
      if (['approved', 'rejected'].includes(nextStatus)) data.reviewedAt = new Date();
    } else if (nextStatus && !isInfluencer) {
      res.status(400);
      throw new Error('Brand can only set todo, approved, or rejected');
    }
  }

  const updated = await prisma.deliverable.update({ where: { id: existing.id }, data });
  res.json({ deliverable: toClient(updated) });
});

// DELETE /api/deliverables/:id
export const deleteDeliverable = asyncHandler(async (req, res) => {
  const existing = await prisma.deliverable.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404);
    throw new Error('Deliverable not found');
  }
  const collab = await assertParticipant(req, existing.collaborationId);
  if (collab.brandId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only the brand can delete deliverables');
  }
  await prisma.deliverable.delete({ where: { id: existing.id } });
  res.json({ ok: true });
});
