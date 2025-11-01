// Jednoduchý proxy server pre Crionic Dashboard
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static(".")); // servíruje index.html a ostatné súbory

// Proxy endpoint na obídenie CORS
app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing ?url=");
  try {
    const r = await fetch(url);
    const text = await r.text();
    res.set("Content-Type", r.headers.get("content-type") || "text/plain");
    res.send(text);
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
});

const PORT = 8080;
app.listen(PORT, () =>
  console.log(`✅ Proxy server beží na http://localhost:${PORT}`)
);
