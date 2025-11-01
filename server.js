import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(".")); // slúži index.html

// --- ENV VARS z Render / VPS ---
const API_KEY = process.env.NESTEX_API_KEY;
const API_SECRET = process.env.NESTEX_API_SECRET;

// Helper – posiela požiadavky na NestEx API
async function nestexPost(endpoint, body = {}) {
  const url = `https://openapi.nestex.one/${endpoint}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY,
        "api-secret": API_SECRET,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch (err) {
    console.error("NestEx API error:", err.message);
    return { status: 500, data: { error: err.message } };
  }
}

// --- ROUTES ---
app.post("/api/nestex/checktoken", async (req, res) => {
  const r = await nestexPost("api/v1/account/checktoken");
  res.status(r.status).json(r.data);
});

app.post("/api/nestex/balances", async (req, res) => {
  const r = await nestexPost("api/v1/account/balances");
  res.status(r.status).json(r.data);
});

app.post("/api/nestex/orders", async (req, res) => {
  const r = await nestexPost("api/v1/order/openOrders");
  res.status(r.status).json(r.data);
});

// --- START SERVER ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Crionic NestEx proxy beží na porte ${PORT}`));
