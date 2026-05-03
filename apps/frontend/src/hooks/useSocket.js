/**
 * @fileoverview useSocket hook.
 *
 * Initialises the Socket.io connection, joins the active workspace room,
 * and wires up all real-time event listeners. Cleans up on unmount.
 */

"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "../lib/socket";
import { SOCKET_EVENTS } from "../constants/index.js";
import useAuthStore from "../stores/authStore";
import useWorkspaceStore from "../stores/workspaceStore";
import useGoalStore from "../stores/goalStore";
import useActionItemStore from "../stores/actionItemStore";
import {
  useAnnouncementStore,
  useNotificationStore,
  useUIStore,
} from "../stores/index";
import toast from "react-hot-toast";

/**
 * Manages the Socket.io lifecycle for the active workspace.
 * Should be mounted once in the dashboard layout.
 */
const useSocket = () => {
  const { user } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();
  const { onGoalUpdate, onActivityUpdate } = useGoalStore();
  const { onItemUpdate } = useActionItemStore();
  const { onNewAnnouncement } = useAnnouncementStore();
  const { addNotification } = useNotificationStore();
  const { setOnlineUsers } = useUIStore();
  const socketRef = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    if (!user || !activeWorkspace) return;

    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    // Join new workspace room (leave old one first)
    if (workspaceRef.current && workspaceRef.current !== activeWorkspace.id) {
      socket.emit(SOCKET_EVENTS.LEAVE_WORKSPACE, workspaceRef.current);
    }
    socket.emit(SOCKET_EVENTS.JOIN_WORKSPACE, activeWorkspace.id);
    workspaceRef.current = activeWorkspace.id;

    // ── Event Listeners ─────────────────────────────────────────────────────

    socket.on(SOCKET_EVENTS.ONLINE_USERS, setOnlineUsers);

    socket.on(SOCKET_EVENTS.GOAL_CREATED, (goal) => {
      onGoalUpdate(goal);
      if (goal.owner?.id !== user.id) {
        toast(`📎 New goal: "${goal.title}"`, { duration: 3000 });
      }
    });

    socket.on(SOCKET_EVENTS.GOAL_UPDATED, onGoalUpdate);
    socket.on(SOCKET_EVENTS.GOAL_STATUS_CHANGED, (goal) => {
      onGoalUpdate(goal);
      toast(`🎯 "${goal.title}" → ${goal.status.replace("_", " ")}`, {
        duration: 2500,
      });
    });

    socket.on(SOCKET_EVENTS.ANNOUNCEMENT_CREATED, (announcement) => {
      onNewAnnouncement(announcement);
      if (announcement.author?.id !== user.id) {
        toast(`📢 New announcement: "${announcement.title}"`, {
          duration: 3000,
        });
      }
    });

    socket.on(SOCKET_EVENTS.ACTION_ITEM_CREATED, onItemUpdate);
    socket.on(SOCKET_EVENTS.ACTION_ITEM_UPDATED, onItemUpdate);
    socket.on(SOCKET_EVENTS.ACTION_ITEM_STATUS_CHANGED, (item) => {
      onItemUpdate(item);
    });

    socket.on(SOCKET_EVENTS.ACTIVITY_UPDATE, onActivityUpdate);

    socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, (notification) => {
      addNotification(notification);
      toast(`🔔 ${notification.title}`, { duration: 4000 });
    });

    return () => {
      socket.off(SOCKET_EVENTS.ONLINE_USERS);
      socket.off(SOCKET_EVENTS.GOAL_CREATED);
      socket.off(SOCKET_EVENTS.GOAL_UPDATED);
      socket.off(SOCKET_EVENTS.GOAL_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.ANNOUNCEMENT_CREATED);
      socket.off(SOCKET_EVENTS.ACTION_ITEM_CREATED);
      socket.off(SOCKET_EVENTS.ACTION_ITEM_UPDATED);
      socket.off(SOCKET_EVENTS.ACTION_ITEM_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.ACTIVITY_UPDATE);
      socket.off(SOCKET_EVENTS.NEW_NOTIFICATION);
    };
  }, [user, activeWorkspace?.id]);

  return socketRef.current;
};

export default useSocket;
