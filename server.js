// Proxy server pre Crionic dashboard - len pre CoinPaprika (alebo ľubovoľné URL cez ?url=)
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// Proxy endpoint (pred static)
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing ?url=");
  try {
    const decoded = decodeURIComponent(target);
    const response = await fetch(decoded);
    const contentType = response.headers.get("content-type") || "text/plain";
    res.set("Content-Type", contentType);
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
});

// Serve static files (index.html)
app.use(express.static("."));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`✅ Proxy beží na http://localhost:${PORT} (servuje index.html, proxy: /proxy?url=...)`)
);
