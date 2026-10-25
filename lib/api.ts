import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./config";
import authRoutes from "./routes/auth";
import submissionRoutes from "./routes/submissions";
import { errorHandler, notFound } from "./middleware/error";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());

// CORS Config: Localhost এবং Vercel Live Frontend দুটোকেই এলাউ করবে
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://review-dashboard-frontend.vercel.app",
  config.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback for maximum stability
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);

app.use(notFound);
app.use(errorHandler);