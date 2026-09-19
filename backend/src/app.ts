import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import incidentRoutes from "./routes/incident.routes.js";
import reportRoutes from "./routes/report.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import teamRoutes from "./routes/team.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import dispatchRoutes from "./routes/dispatch.routes.js";
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ResQAI backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api", recommendationRoutes);
app.use("/api", dispatchRoutes);
export default app;