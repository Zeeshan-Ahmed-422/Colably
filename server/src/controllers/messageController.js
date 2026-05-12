import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';
import { toClient, publicUser } from '../utils/transform.js';

async function assertParticipant(req, collaborationId) {
  const collab = await prisma.collaboration.findUnique({ where: { id: collaborationId } });
  if (!collab) {
    const err = new Error('Collaboration not found');
    err.status = 404;
    throw err;
  }
  if (collab.brandId !== req.user.id && collab.influencerId !== req.user.id && req.user.role !== 'admin') {
    const err = new Error('Not a participant');
    err.status = 403;
    throw err;
  }
  return collab;
}

function shapeMessage(m) {
  return { ...toClient(m), sender: m.sender ? publicUser(m.sender) : null };
}

// GET /api/messages/by-collaboration/:id
export const listMessages = asyncHandler(async (req, res) => {
  const collab = await assertParticipant(req, req.params.id);
  const items = await prisma.message.findMany({
    where: { collaborationId: collab.id },
    orderBy: { createdAt: 'asc' },
    include: { sender: { include: { handles: true } } },
  });
  res.json({ items: items.map(shapeMessage) });
});

// POST /api/messages  (REST fallback; primary path is socket)
export const sendMessage = asyncHandler(async (req, res) => {
  const { collaborationId, body } = req.body;
  const collab = await assertParticipant(req, collaborationId);
  if (!body?.trim()) {
    res.status(400);
    throw new Error('Empty message');
  }
  const created = await prisma.message.create({
    data: {
      collaborationId: collab.id,
      senderId: req.user.id,
      body: body.trim(),
      readBy: [req.user.id],
    },
    include: { sender: { include: { handles: true } } },
  });

  const shaped = shapeMessage(created);
  const io = req.app.get('io');
  io?.to(`collab:${collab.id}`).emit('message:new', shaped);

  res.status(201).json({ message: shaped });
});
