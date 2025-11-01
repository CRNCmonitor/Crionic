// server.js
// Express proxy + NestEx wrapper (bez zahrnutia tvojich secretov do kódu)
// Použitie:
//   export NESTEX_API_KEY="tvoj_key"
//   export NESTEX_API_SECRET="tvoj_secret"
//   node server.js

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import process from "process";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// načítaj z env (musíš nastaviť)
const NESTEX_KEY = process.env.NESTEX_API_KEY;
const NESTEX_SECRET = process.env.NESTEX_API_SECRET;
if (!NESTEX_KEY || !NESTEX_SECRET) {
  console.warn("⚠️  NESTEX_API_KEY or NESTEX_API_SECRET not set. API endpoints will return 500.");
}

// NestEx base
const NESTEX_BASE = "https://trade.nestex.one/api/v2";

// jednoduchý per-endpoint rate limiter (min gap 5000ms)
const MIN_GAP_MS = 5000;
const lastCallAt = {}; // { endpointName: timestamp }

// helper: enforce 5s gap
function checkRate(endpoint) {
  const now = Date.now();
  const last = lastCallAt[endpoint] || 0;
  const diff = now - last;
  if (diff < MIN_GAP_MS) {
    return { ok: false, wait: Math.ceil((MIN_GAP_MS - diff) / 1000) };
  }
  lastCallAt[endpoint] = now;
  return { ok: true };
}

// helper: call NestEx POST endpoint with required body (apikey, apisecret)
async function callNestEx(path, body = {}) {
  if (!NESTEX_KEY || !NESTEX_SECRET) {
    throw new Error("NESTEX API key/secret not configured on server.");
  }

  // ensure body has apikey & apisecret as required by doc
  const payload = Object.assign({}, body, {
    apikey: NESTEX_KEY,
    apisecret: NESTEX_SECRET,
  });

  const url = `${NESTEX_BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  // return parsed JSON if possible, else raw text
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

// API endpoint: checktoken
app.post("/api/nestex/checktoken", async (req, res) => {
  const rate = checkRate("checktoken");
  if (!rate.ok) return res.status(429).json({ error: `Rate limit: wait ${rate.wait}s` });
  try {
    const r = await callNestEx("/checktoken", {});
    res.status(r.status).json(r.data);
  } catch (e) {
    console.error("checktoken error:", e.message || e);
    res.status(500).json({ error: "server error", detail: String(e.message || e) });
  }
});

// API endpoint: balances
app.post("/api/nestex/balances", async (req, res) => {
  const rate = checkRate("balances");
  if (!rate.ok) return res.status(429).json({ error: `Rate limit: wait ${rate.wait}s` });
  try {
    const r = await callNestEx("/balances", {});
    res.status(r.status).json(r.data);
  } catch (e) {
    console.error("balances error:", e.message || e);
    res.status(500).json({ error: "server error", detail: String(e.message || e) });
  }
});

// API endpoint: orders
app.post("/api/nestex/orders", async (req, res) => {
  const rate = checkRate("orders");
  if (!rate.ok) return res.status(429).json({ error: `Rate limit: wait ${rate.wait}s` });
  try {
    const r = await callNestEx("/orders", {});
    res.status(r.status).json(r.data);
  } catch (e) {
    console.error("orders error:", e.message || e);
    res.status(500).json({ error: "server error", detail: String(e.message || e) });
  }
});

/* Optional transactional endpoints (placelimitorder, cancelorder).
   THESE ARE DANGEROUS: they execute trades. Keep them disabled unless you
   know what you're doing. If you enable, DO NOT expose publicly without auth.
*/

// Serve static files (index.html) from current dir
app.use(express.static("."));

// fallback
app.use((req, res) => res.status(404).send("Not found"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server beží na http://localhost:${PORT}`);
  console.log("✅ Endpoints: POST /api/nestex/checktoken, /api/nestex/balances, /api/nestex/orders");
  console.log("🔒 Make sure NESTEX_API_KEY and NESTEX_API_SECRET are set in env (not in code).");
});
