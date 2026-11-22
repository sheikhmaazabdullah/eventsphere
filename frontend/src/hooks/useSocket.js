import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket = null;

/**
 * useSocket — singleton Socket.IO hook.
 * Connects once and reuses the connection across the app.
 *
 * @param {string} userId    Join user-specific room for notifications
 * @param {string} [expoId]  Join expo-specific room for real-time updates
 * @returns {object}         The socket instance
 */
const useSocket = (userId, expoId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Create singleton connection
    if (!socket) {
      socket = io(window.location.origin, { transports: ['websocket', 'polling'] });
    }
    socketRef.current = socket;

    // Join personal room for notifications
    socket.emit('join-user', userId);

    return () => {
      // Don't disconnect on unmount — keep singleton alive
    };
  }, [userId]);

  useEffect(() => {
    if (!expoId || !socket) return;
    socket.emit('join-expo', expoId);
    return () => socket.emit('leave-expo', expoId);
  }, [expoId]);

  return socketRef.current;
};

export { useSocket };
export const getSocket = () => socket;
