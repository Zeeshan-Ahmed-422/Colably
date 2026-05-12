import 'dotenv/config';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import registerChatSocket from './sockets/chat.js';

const PORT = process.env.PORT || 5050;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: { origin: CLIENT_ORIGIN, credentials: true },
});

registerChatSocket(io);
app.set('io', io);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`[server] listening on http://localhost:${PORT}`);
      console.log(`[server] socket.io ready (cors: ${CLIENT_ORIGIN})`);
    });
  })
  .catch((err) => {
    console.error('[server] failed to connect to Postgres:', err.message);
    process.exit(1);
  });
