/**
 * @fileoverview Socket.io client singleton.
 *
 * Returns a single socket instance reused across the app.
 * The socket connects lazily — only when getSocket() is first called.
 */

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

/** @type {import('socket.io-client').Socket|null} */
let socket = null;

/**
 * Returns (and lazily creates) the Socket.io client instance.
 * Pass the access token for server-side authentication.
 *
 * @param {string} [token] - JWT access token for socket auth
 * @returns {import('socket.io-client').Socket}
 */
export const getSocket = (token) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

/**
 * Disconnects and destroys the current socket instance.
 * Call this on logout.
 */
export const destroySocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;
