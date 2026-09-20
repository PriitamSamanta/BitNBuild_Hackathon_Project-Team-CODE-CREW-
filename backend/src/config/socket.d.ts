import type { Server } from "socket.io";
export declare const setSocketServer: (server: Server) => void;
export declare const getSocketServer: () => Server | null;
export declare const emitSocketEvent: (event: string, payload: unknown) => void;
//# sourceMappingURL=socket.d.ts.map