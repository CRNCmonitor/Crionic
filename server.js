// Proxy server pre Crionic Dashboard (plne funkčný)
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// Proxy endpoint (musí byť pred static)
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

// Static files last
app.use(express.static("."));

const PORT = 8080;
app.listen(PORT, () =>
  console.log(`✅ Proxy beží na http://localhost:${PORT}\nPoužívaj /proxy?url=...`)
);
