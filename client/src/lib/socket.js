import { io } from 'socket.io-client';

let socket = null;

// Same idea as api.js: dev uses '/' (Vite proxies it), prod uses VITE_API_URL.
const SOCKET_URL = import.meta.env.VITE_API_URL || '/';

export function getSocket() {
  if (socket && socket.connected) return socket;
  const token = localStorage.getItem('icp_token');
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
