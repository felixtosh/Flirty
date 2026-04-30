import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
import http from "http";
import express from "express";
import cors from "cors";
import { createHardwareManager } from "./hardware/index.js";
import { hardwareRoutes } from "./routes/hardware.js";
import { resetRoutes } from "./routes/reset.js";
import { signedUrlRoutes } from "./routes/signed-url.js";
import { chatRoutes } from "./routes/chat.js";
import { setupWebSocket } from "./ws.js";
import { syncAgent } from "./setup-agent.js";

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
app.use("/api/signed-url", signedUrlRoutes());
app.use("/api/chat", chatRoutes());

setupWebSocket(server, hw);

server.listen(PORT, () => {
  console.log(`Flirty server running on http://localhost:${PORT}`);
  syncAgent().catch((err) => console.error("[agent] Sync failed:", err.message));
});
