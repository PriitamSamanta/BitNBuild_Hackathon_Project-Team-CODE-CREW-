import "dotenv/config";
import http from "node:http";
import { Server } from "socket.io";
import { startAlertMonitor } from "./services/alert-monitor.service.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import { setSocketServer } from "./config/socket.js";
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    await connectDB();
    startAlertMonitor();
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });
    setSocketServer(io);
    io.on("connection", (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);
        socket.on("disconnect", () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });
    httpServer.listen(PORT, () => {
        console.log(`🚨 ResQAI backend running on port ${PORT}`);
        console.log(`🔌 Socket.IO running on port ${PORT}`);
    });
};
startServer();
//# sourceMappingURL=server.js.map