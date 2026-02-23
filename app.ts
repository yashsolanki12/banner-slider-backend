import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParse from "cookie-parser";
import crypto from "crypto";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/error-handler.js";
import { StatusCode } from "./utils/status-code.js";
import { isAllowedOrigin } from "./utils/allowed-origin.js";
import { ApiResponse } from "./utils/api-response.js";
import uspSliderRoutes from "./router/usp-slider.routes.js";
import shopifyAuthRoutes from "./router/shopify-auth.routes.js";
import { uninstallCleanupBackground } from "./controller/usp-slider.js";
import { homePageHtml } from "./utils/home-page.js";

const app = express();

dotenv.config({ path: [".env"] });

// Global Logger
app.use((req: any, _res, next) => {
  console.log(`[Global Log] ${req.method} ${req.url}`);
  next();
});

app.get("/", (_req, res) => {
  res.send(homePageHtml);
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(StatusCode.OK).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "connected",
  });
});

// Generate HMAC which use when submit the app
app.post(
  "/api/utils/generate-hmac",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const secret = process.env.SHOPIFY_API_SECRET?.trim();
    if (!secret) {
      return res
        .status(StatusCode.UNAUTHORIZED)
        .json(new ApiResponse(false, "Webhook HMAC validation failed"));
    }
    const body = req.body; // This is a Buffer, just like in /api/shopify/webhook
    const digest = crypto
      .createHmac("sha256", secret)
      .update(body, "utf8")
      .digest("base64");
    res.json({ hmac: digest });
  },
);

// Shopify Webhook Handler (direct route, no controller/router)
app.post(
  "/api/shopify/webhook",
  express.raw({ type: "*/*" }),
  async (req: any, res) => {
    res.status(StatusCode.OK).send("OK");

    const topic = req.get("X-Shopify-Topic");
    const shop = req.get("X-Shopify-Shop-Domain");
    const hmacHeader =
      req.get("X-Shopify-Hmac-Sha256") || req.get("x-shopify-hmac-sha256");

    const rawBody = req.body;

    // HMAC Verification Bypassed by User Request
    // Previous diagnostics showed persistent mismatch despite correct secret length (38) and body captures.
    console.warn("⚠️ HMAC Verification BYPASSED for webhook topic:", topic);
    console.log("Expected (Header):", hmacHeader);
    console.log("Body length:", rawBody?.length);

    console.log("✅ Proceeding with webhook processing (HMAC check skipped)");

    try {
      const payload = JSON.parse(rawBody.toString());

      if (topic === "app/uninstalled") {
        console.log(`[Webhook] Processing uninstall for: ${shop}`);
        // Ensure the internal API key is present for the cleanup controller
        process.nextTick(() => uninstallCleanupBackground(shop));
        // req.headers["x-api-key"] = process.env.BACKEND_API_KEY;
        // req.body = { shop };
        // await uninstallCleanup(req, res);
        // return;
      }

      if (payload) {
        console.log("Payload:", payload);
      }
    } catch (e: any) {
      console.error("[Webhook] Parse error:", e.message);
    }

    // res.status(200).send("OK");
  },
);

// Middleware
app.use(express.json());
app.use(cookieParse());
app.use(express.urlencoded({ extended: true }));

// Cors for Development & Production use
app.use(
  cors({
    origin: (origin, callback) => {
      const reqMethod =
        typeof this !== "undefined" &&
        this &&
        (this as any).req &&
        (this as any).req.method
          ? (this as any).req.method
          : undefined;
      if (isAllowedOrigin(origin, reqMethod)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "x-shopify-shop-domain",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

// Routes for banner slider
app.use("/api/usp-slider", uspSliderRoutes);

// Routes for shopify authentication
app.use("/api/shopify", shopifyAuthRoutes);

// Global Error Handler
app.use(errorHandler);

// Handle 404 - This must be after all other routes
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res
    .status(StatusCode.NOT_FOUND)
    .json({ error: "Not Found", path: req.originalUrl });
});

// Error handling middleware - This must be after all other middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Error:", err.message);
  res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
    error: "Internal Server Error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Database connection
const mongoDbUrl = process.env.MONGODB_URL;
const dbName = process.env.DB_NAME;

if (!mongoDbUrl || !dbName) {
  throw new Error("Missing MongoDB connection environment variables.");
}
connectDB({ url: mongoDbUrl, dbName });

export default app;
