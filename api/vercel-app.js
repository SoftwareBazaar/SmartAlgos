/**
 * Minimal Express app for Vercel serverless — Capital payments + health only.
 */
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.BACKEND_URL,
  process.env.CAPITAL_CLIENT_URL,
  "https://www.smartalgosts.com",
  "https://smartalgosts.com",
  "http://localhost:5173",
  "http://localhost:3000",
]
  .filter(Boolean)
  .map((o) => o.replace(/\/$/, ""));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, "");
      if (
        allowedOrigins.includes(normalized) ||
        normalized.endsWith(".vercel.app")
      ) {
        return callback(null, normalized);
      }
      return callback(null, normalized);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "OK", service: "capital-api", timestamp: new Date().toISOString() });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", service: "capital-api", timestamp: new Date().toISOString() });
});

const capitalPayments = require("./routes/capitalPayments");
app.use("/api/payments/capital", capitalPayments);
app.use("/payments/capital", capitalPayments);

app.use((err, _req, res, _next) => {
  console.error("[capital-api]", err.message);
  res.status(500).json({ success: false, error: err.message || "Server error" });
});

module.exports = app;
