import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { connectDb } from "./config/db.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { seedDatabase } from "./seed.js";
import { User } from "./models/User.js";

const app = express();
const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.set("etag", false);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: process.env.TENANT_NAME || "Aurelia" });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32 ||
  process.env.JWT_SECRET.startsWith("replace-with-") ||
  ["change-this-to-a-long-random-secret", "local-docker-secret-change-before-deploy"].includes(
    process.env.JWT_SECRET
  )
) {
  console.error("Set JWT_SECRET to a unique random value of at least 32 characters (not a placeholder).");
  process.exit(1);
}

connectDb()
  .then(() => {
    // Existing accounts predate email verification; preserve their access on upgrade.
    return User.updateMany(
      { emailVerified: { $exists: false } },
      { $set: { emailVerified: true } }
    );
  })
  .then(() => {
    const seedDemoData = process.env.SEED_DEMO_DATA === "true";
    return seedDemoData ? seedDatabase() : undefined;
  })
  .then(() => {
    app.listen(port, () => console.log(`Aurelia API on :${port}`));
  })
  .catch((err) => {
    console.error("Failed to start", err);
    process.exit(1);
  });
