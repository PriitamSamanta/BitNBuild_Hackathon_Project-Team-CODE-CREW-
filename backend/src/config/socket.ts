import type { Server } from "socket.io";

let io: Server | null = null;

export const setSocketServer = (server: Server): void => {
  io = server;
};

export const getSocketServer = (): Server | null => {
  return io;
};

export const emitSocketEvent = (
  event: string,
  payload: unknown
): void => {
  io?.emit(event, payload);
};