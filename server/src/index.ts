import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { createHardwareManager } from "./hardware/index.js";
import { hardwareRoutes } from "./routes/hardware.js";
import { resetRoutes } from "./routes/reset.js";
import { setupWebSocket } from "./ws.js";

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3001;

const hw = createHardwareManager();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/hardware", hardwareRoutes(hw));
app.use("/api/reset", resetRoutes(hw));

setupWebSocket(server, hw);

server.listen(PORT, () => {
  console.log(`Flirty server running on http://localhost:${PORT}`);
});
