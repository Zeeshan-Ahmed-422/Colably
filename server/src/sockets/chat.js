import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { toClient, publicUser } from '../utils/transform.js';

/**
 * Real-time chat over Socket.io (backed by Postgres via Prisma).
 *
 * Auth: client passes JWT in `auth.token`. Middleware resolves the user.
 * Rooms: one per collaboration (`collab:<id>`) plus a personal room
 *        (`user:<id>`) for cross-collab notifications.
 */
export default function registerChatSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || user.status === 'suspended') return next(new Error('Unauthorized'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Auth failed: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);

    socket.on('collab:join', async (collaborationId, ack) => {
      try {
        const collab = await prisma.collaboration.findUnique({ where: { id: collaborationId } });
        if (!collab) throw new Error('Collaboration not found');
        const isParticipant =
          collab.brandId === userId ||
          collab.influencerId === userId ||
          socket.user.role === 'admin';
        if (!isParticipant) throw new Error('Not a participant');
        socket.join(`collab:${collaborationId}`);
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('collab:leave', (collaborationId) => {
      socket.leave(`collab:${collaborationId}`);
    });

    socket.on('message:send', async ({ collaborationId, body }, ack) => {
      try {
        const collab = await prisma.collaboration.findUnique({ where: { id: collaborationId } });
        if (!collab) throw new Error('Collaboration not found');
        const isParticipant = collab.brandId === userId || collab.influencerId === userId;
        if (!isParticipant) throw new Error('Not a participant');
        if (!body?.trim()) throw new Error('Empty message');

        const created = await prisma.message.create({
          data: {
            collaborationId,
            senderId: userId,
            body: body.trim(),
            readBy: [userId],
          },
          include: { sender: { include: { handles: true } } },
        });
        const shaped = { ...toClient(created), sender: publicUser(created.sender) };

        io.to(`collab:${collaborationId}`).emit('message:new', shaped);
        const peerId = collab.brandId === userId ? collab.influencerId : collab.brandId;
        io.to(`user:${peerId}`).emit('message:notify', {
          collaborationId,
          preview: shaped.body.slice(0, 80),
          from: { _id: userId, id: userId, name: socket.user.name },
        });

        ack?.({ ok: true, message: shaped });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('typing', ({ collaborationId, isTyping }) => {
      socket.to(`collab:${collaborationId}`).emit('typing', {
        userId,
        isTyping: !!isTyping,
      });
    });
  });
}
