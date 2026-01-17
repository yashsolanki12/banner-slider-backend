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
import bannerSliderRoutes from "./router/banner-slider.routes.js";
import shopifyAuthRoutes from "./router/shopify-auth.routes.js";
const app = express();
dotenv.config({ path: [".env"] });
app.get("/", (_req, res) => {
    res.json({ message: "Server is running 🚀" });
});
app.post("/api/utils/generate-hmac", express.raw({ type: "application/json" }), (req, res) => {
    const secret = process.env.SHOPIFY_API_SECRET;
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
// Shopify Webhook Handler (direct route, no controller/router)
app.post("/api/shopify/webhook", express.raw({ type: "application/json" }), (req, res) => {
    const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
    const secret = process.env.SHOPIFY_API_SECRET;
    if (!secret) {
        return res
            .status(StatusCode.UNAUTHORIZED)
            .json(new ApiResponse(false, "Webhook HMAC validation failed"));
    }
    const body = req.body;
    const digest = crypto
        .createHmac("sha256", secret)
        .update(body, "utf8")
        .digest("base64");
    if (digest !== hmacHeader) {
        return res
            .status(StatusCode.UNAUTHORIZED)
            .json(new ApiResponse(false, "Webhook HMAC validation failed"));
    }
    // Parse the webhook payload
    try {
        JSON.parse(body.toString());
    }
    catch (e) {
        return res
            .status(StatusCode.BAD_REQUEST)
            .json(new ApiResponse(false, "Invalid JSON"));
    }
    res.status(StatusCode.OK).json(new ApiResponse(true, "Webhook received"));
});
// Middleware
app.use(express.json());
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
    allowedHeaders: ["Content-Type", "x-shopify-shop-domain"],
}));
// Routes for banner slider
app.use("/api/banner-slider", bannerSliderRoutes);
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
app.use((err, _req, res, _next) => {
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
//# sourceMappingURL=app.js.map