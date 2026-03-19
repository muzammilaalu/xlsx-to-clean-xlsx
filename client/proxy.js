import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve Vite build (dist folder)
app.use("/", express.static(path.join(__dirname, "dist")));

// Backend API reverse proxy
app.use(
  "/convert-excel",
  createProxyMiddleware({
    target: "http://localhost:5000",
    changeOrigin: true,
  })
);

// SPA fallback (for React routing)
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(8080, () => {
  console.log("🔥 Reverse Proxy running on port 8080 (Frontend + API merged)");
});