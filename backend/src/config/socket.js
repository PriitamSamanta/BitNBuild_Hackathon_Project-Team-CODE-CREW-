let io = null;
export const setSocketServer = (server) => {
    io = server;
};
export const getSocketServer = () => {
    return io;
};
export const emitSocketEvent = (event, payload) => {
    io?.emit(event, payload);
};
//# sourceMappingURL=socket.js.map