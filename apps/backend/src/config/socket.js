/**
 * @fileoverview Socket.io server initialisation and event handlers.
 *
 * Handles all real-time communication:
 * - Workspace room management (join/leave)
 * - Online user presence tracking
 * - Broadcasting workspace events (goals, announcements, action items)
 * - Delivering in-app notifications
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { SOCKET_EVENTS } from '@team-hub/shared';

/** @type {Server} Singleton Socket.io server instance */
let io;

/**
 * Map of workspaceId → Set of online user objects {userId, name, avatarUrl}
 * @type {Map<string, Map<string, Object>>}
 */
const onlineUsers = new Map();

/**
 * Initialises Socket.io and attaches it to the HTTP server.
 * @param {import('http').Server} httpServer - The Node.js HTTP server instance
 * @returns {Server} The configured Socket.io server
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ─── Authentication Middleware ─────────────────────────────────────────────

  io.use((socket, next) => {
    try {
      // Token can come from query param or cookie (for browser clients)
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.userId;
      socket.userName = decoded.name;
      socket.userAvatar = decoded.avatarUrl;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ─── Connection Handler ────────────────────────────────────────────────────

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.userId})`);

    // ── Join a workspace room ──────────────────────────────────────────────

    socket.on(SOCKET_EVENTS.JOIN_WORKSPACE, (workspaceId) => {
      socket.join(workspaceId);
      socket.currentWorkspaceId = workspaceId;

      // Track online presence
      if (!onlineUsers.has(workspaceId)) {
        onlineUsers.set(workspaceId, new Map());
      }
      onlineUsers.get(workspaceId).set(socket.userId, {
        userId: socket.userId,
        name: socket.userName,
        avatarUrl: socket.userAvatar,
      });

      // Broadcast updated online user list to the workspace
      const usersInWorkspace = Array.from(onlineUsers.get(workspaceId).values());
      io.to(workspaceId).emit(SOCKET_EVENTS.ONLINE_USERS, usersInWorkspace);

      console.log(`👥 User ${socket.userId} joined workspace ${workspaceId}`);
    });

    // ── Leave a workspace room ─────────────────────────────────────────────

    socket.on(SOCKET_EVENTS.LEAVE_WORKSPACE, (workspaceId) => {
      handleLeaveWorkspace(socket, workspaceId);
    });

    // ── Disconnect ─────────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      if (socket.currentWorkspaceId) {
        handleLeaveWorkspace(socket, socket.currentWorkspaceId);
      }
    });
  });

  console.log('✅ Socket.io initialised');
  return io;
};

/**
 * Removes a user from a workspace's online list and broadcasts the update.
 * @param {import('socket.io').Socket} socket
 * @param {string} workspaceId
 */
function handleLeaveWorkspace(socket, workspaceId) {
  socket.leave(workspaceId);

  if (onlineUsers.has(workspaceId)) {
    onlineUsers.get(workspaceId).delete(socket.userId);

    const usersInWorkspace = Array.from(onlineUsers.get(workspaceId).values());
    io.to(workspaceId).emit(SOCKET_EVENTS.ONLINE_USERS, usersInWorkspace);

    if (onlineUsers.get(workspaceId).size === 0) {
      onlineUsers.delete(workspaceId);
    }
  }
}

/**
 * Returns the Socket.io server instance.
 * Must be called after initSocket().
 * @returns {Server}
 */
export const getIo = () => {
  if (!io) throw new Error('Socket.io not initialised. Call initSocket() first.');
  return io;
};

/**
 * Emits a Socket.io event to all clients in a workspace room.
 * @param {string} workspaceId - The workspace room to broadcast to
 * @param {string} event - The SOCKET_EVENTS constant value
 * @param {*} data - The payload to send
 */
export const emitToWorkspace = (workspaceId, event, data) => {
  if (io) {
    io.to(workspaceId).emit(event, data);
  }
};

/**
 * Emits a Socket.io event to a specific user (all their connected sockets).
 * @param {string} userId - Target user ID
 * @param {string} event - Event name
 * @param {*} data - Payload
 */
export const emitToUser = (userId, event, data) => {
  if (io) {
    // Find all sockets belonging to this user
    io.sockets.sockets.forEach((socket) => {
      if (socket.userId === userId) {
        socket.emit(event, data);
      }
    });
  }
};
