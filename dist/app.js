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
import storeMetricsRoutes from "./router/store-metrics.routes.js";
import { uninstallCleanup, } from "./controller/usp-slider.js";
import { homePageHtml } from "./utils/home-page.js";
const app = express();
dotenv.config({ path: [".env"] });
// Global Logger
app.use((req, _res, next) => {
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
app.post("/api/utils/generate-hmac", express.raw({ type: "application/json" }), (req, res) => {
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
});
// Use this while Automated checks for common errors for HMAC and Uninstallation of App(✔)
app.post("/api/shopify/webhook", express.raw({ type: "*/*" }), // Capture EVERYTHING to be safe
async (req, res, next) => {
    const topic = req.get("X-Shopify-Topic");
    const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
    const shopHeader = req.get("X-Shopify-Shop-Domain");
    console.log(`[Webhook] Topic: ${topic}, Shop: ${shopHeader}`);
    const rawSecret = process.env.SHOPIFY_API_SECRET?.trim() || "";
    // Remove literal quotes if present
    const cleanSecret = rawSecret.replace(/^["']|["']$/g, "");
    if (!cleanSecret) {
        console.error("[Webhook] SHOPIFY_API_SECRET is missing!");
        return res
            .status(500)
            .json({ success: false, message: "Missing Secret" });
    }
    const body = req.body;
    if (!body || body.length === 0) {
        console.error("[Webhook] Body length is 0. Middleware issue?");
        return res.status(400).json({ success: false, message: "Empty Body" });
    }
    // Diagnostics: Log secret structure
    const maskedSecret = cleanSecret.substring(0, 15) +
        "..." +
        cleanSecret.substring(cleanSecret.length - 4);
    console.log(`[Webhook] Secret Structure: "${maskedSecret}" (Length: ${cleanSecret.length})`);
    // Check for common typo (Index 17 is the 18th character)
    if (cleanSecret.length >= 18 && cleanSecret[17] === "0") {
        console.warn("[Webhook] ⚠️ WARNING: 18th character is '0'. Typo check needed!");
    }
    // Try all possible interpretations
    const variants = [
        cleanSecret, // Exact
        cleanSecret.replace("shpss_", ""), // No prefix
    ];
    let verified = false;
    // let fallbackHmac = "";
    for (const secret of variants) {
        const hmac = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("base64");
        if (hmac === hmacHeader) {
            verified = true;
            break;
        }
        // fallbackHmac = hmac;
    }
    if (!verified) {
        console.error(`[Webhook] HMAC MISMATCH!`);
        console.error(`[Webhook] Calculated 1 (Exact): ${crypto.createHmac("sha256", cleanSecret).update(body).digest("base64")}`);
        console.error(`[Webhook] Received Header:    ${hmacHeader}`);
        return res
            .status(401)
            .json(new ApiResponse(false, "HMAC validation failed"));
    }
    console.log("[Webhook] ✅ HMAC Verified Successfully!");
    try {
        const payload = JSON.parse(body.toString());
        const shop = shopHeader || payload.myshopify_domain || payload.shop;
        if (topic === "app/uninstalled") {
            console.log(`[Webhook] Processing uninstall for: ${shop}`);
            req.headers["x-api-key"] = process.env.BACKEND_API_KEY;
            req.body = { shop };
            await uninstallCleanup(req, res, next);
            return;
        }
    }
    catch (e) {
        console.error("[Webhook] Parse error:", e);
    }
    res.status(StatusCode.OK).json(new ApiResponse(true, "Received"));
});
// Shopify Webhook Handler (direct route, no controller/router) (original)
// app.post(
//   "/api/shopify/webhook",
//   express.raw({ type: "*/*" }),
//   async (req: any, res) => {
//     res.status(StatusCode.OK).send("OK");
//     const topic = req.get("X-Shopify-Topic");
//     const shop = req.get("X-Shopify-Shop-Domain");
//     const hmacHeader =
//       req.get("X-Shopify-Hmac-Sha256") || req.get("x-shopify-hmac-sha256");
//     const rawBody = req.body;
//     // HMAC Verification Bypassed by User Request
//     // Previous diagnostics showed persistent mismatch despite correct secret length (38) and body captures.
//     console.warn("⚠️ HMAC Verification BYPASSED for webhook topic:", topic);
//     console.log("Expected (Header):", hmacHeader);
//     console.log("Body length:", rawBody?.length);
//     console.log("✅ Proceeding with webhook processing (HMAC check skipped)");
//     try {
//       const payload = JSON.parse(rawBody.toString());
//       if (topic === "app/uninstalled") {
//         console.log(`[Webhook] Processing uninstall for: ${shop}`);
//         // Ensure the internal API key is present for the cleanup controller
//         process.nextTick(() => uninstallCleanupBackground(shop));
//         // req.headers["x-api-key"] = process.env.BACKEND_API_KEY;
//         // req.body = { shop };
//         // await uninstallCleanup(req, res);
//         // return;
//       }
//       if (payload) {
//         console.log("Payload:", payload);
//       }
//     } catch (e: any) {
//       console.error("[Webhook] Parse error:", e.message);
//     }
//     // res.status(200).send("OK");
//   },
// );
// Middleware - Limit to 5MB to handle 2MB images with base64 encoding overhead (~37%)
app.use(express.json({ limit: "5mb" }));
// Handle payload too large errors
app.use((err, _req, res, next) => {
    if (err.type === "entity.parse.failed" || err.status === 413) {
        return res.status(413).json({
            success: false,
            message: "Request payload too large. Please reduce image size to under 2MB.",
        });
    }
    next(err);
});
app.use(cookieParse());
app.use(express.urlencoded({ extended: true }));
// Cors for Development & Production use
app.use(cors({
    origin: (origin, callback) => {
        const reqMethod = typeof this !== "undefined" &&
            this &&
            this.req &&
            this.req.method
            ? this.req.method
            : undefined;
        if (isAllowedOrigin(origin, reqMethod)) {
            callback(null, true);
        }
        else {
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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
}));
// Routes for banner slider
app.use("/api/usp-slider", uspSliderRoutes);
// Routes for shopify authentication
app.use("/api/shopify", shopifyAuthRoutes);
// Routes for store metrics
app.use("/api/store-metrics", storeMetricsRoutes);
// Handle 404 - This must be after all other routes
app.use((req, res) => {
    console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
    res
        .status(StatusCode.NOT_FOUND)
        .json({ error: "Not Found", path: req.originalUrl });
});
// Global Error Handler
app.use(errorHandler);
// Database connection
const mongoDbUrl = process.env.MONGODB_URL;
const dbName = process.env.DB_NAME;
if (!mongoDbUrl || !dbName) {
    throw new Error("Missing MongoDB connection environment variables.");
}
connectDB({ url: mongoDbUrl, dbName });
export default app;
//# sourceMappingURL=app.js.map