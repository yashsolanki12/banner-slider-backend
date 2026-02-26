import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import * as uspSliderService from "../service/usp-slider.js";
import mongoose from "mongoose";
import shopifySession from "../models/shopify-session.js";
// Get current shopify_session_id
export const getCurrentShopifySessionId = async (req, res) => {
    try {
        const shopDomain = req.headers["x-shopify-shop-domain"];
        console.log("🔑 getCurrentShopifySessionId - Shop domain:", shopDomain);
        if (!shopDomain) {
            console.log("❌ Missing shop domain header in session request");
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Missing shop domain header."));
        }
        const sessionDoc = await mongoose.connection
            .collection("shopify_sessions")
            .findOne({ shop: shopDomain });
        console.log("🔍 Session document found:", sessionDoc ? "Yes" : "No");
        if (!sessionDoc || !sessionDoc._id) {
            console.log("❌ Session not found for shop:", shopDomain);
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "Session not found."));
        }
        if (sessionDoc) {
            console.log("✅ Session found successfully");
            return res.json(new ApiResponse(true, "Shopify session retrieved successfully.", sessionDoc));
        }
    }
    catch (error) {
        console.error("❌ Error in getCurrentShopifySessionId:", error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal server error"));
    }
};
// Create
export const createUspSlider = async (req, res, next) => {
    try {
        const { title, description, shopify_session_id, designSettings, icon } = req.body;
        if (!title || !description || !shopify_session_id) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Title, description and shopify_session_id are required."));
        }
        const response = await uspSliderService.createUsp({
            title,
            description,
            shopify_session_id,
            designSettings,
            icon,
        });
        if (!response) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Failed to create new usp bar."));
        }
        if (response) {
            return res
                .status(StatusCode.CREATED)
                .json(new ApiResponse(true, "USP Bar created successfully.", response));
        }
    }
    catch (error) {
        next(error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
// List
export const getAllUspSlider = async (_req, res, next) => {
    try {
        // Get shop domain header
        const shopDomain = res.req.headers["x-shopify-shop-domain"];
        console.log("📱 Get all usp slider - Shop Domain", shopDomain);
        if (!shopDomain) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Missing shop domain header."));
        }
        // Find the session for this shop
        const sessionDoc = await mongoose.connection
            .collection("shopify_sessions")
            .findOne({ shop: shopDomain });
        console.log("Session found for all USP Bar 🔎", sessionDoc ? "Yes" : "No");
        if (!sessionDoc || !sessionDoc._id) {
            console.log("❌ Session not found for shop:", shopDomain);
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "Session not found."));
        }
        const response = await uspSliderService.getAllUsp({
            shopify_session_id: sessionDoc._id,
        });
        if (!response || response.length === 0) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(false, "No USP Bar found.", []));
        }
        if (response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "USP Bar retrieved successfully.", response));
        }
    }
    catch (error) {
        next(error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
// Detail
export const getUspSliderById = async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Invalid USP Bar ID format."));
        }
        const response = await uspSliderService.getUspById(id);
        if (!response) {
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "USP Bar not found."));
        }
        if (response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "USP Bar retrieved successfully.", response));
        }
    }
    catch (error) {
        next(error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
// Update
export const updateUspSliderById = async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { title, description, designSettings, icon } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Invalid USP Bar ID format."));
        }
        if (!title || !description) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Title, description are required."));
        }
        const response = await uspSliderService.updateUspById(id, {
            title,
            description,
            designSettings,
            icon,
        });
        if (!response) {
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "USP Bar not found."));
        }
        if (response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "USP Bar updated successfully.", response));
        }
    }
    catch (error) {
        next(error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
// Delete
export const deleteUspSliderById = async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Invalid USP Bar ID format."));
        }
        const response = await uspSliderService.deleteUspById(id);
        if (!response) {
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "USP Bar not found."));
        }
        if (response) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "USP Bar deleted successfully.", response));
        }
    }
    catch (error) {
        next(error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
// Toggle enabled status
export const toggleUspSliderEnabled = async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Invalid USP Bar ID format."));
        }
        const response = await uspSliderService.toggleEnabled(id);
        if (!response) {
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "USP Bar not found."));
        }
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, `USP Bar ${response.enabled ? "enabled" : "disabled"} successfully.`, response));
    }
    catch (error) {
        next(error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal Server Error"));
    }
};
// Handle GET, POST, DELETE for /api/phone/offline_{shop}
export const handleOfflineSession = async (req, res) => {
    const shopParam = Array.isArray(req.params.shop)
        ? req.params.shop[0]
        : req.params.shop;
    const shop = shopParam?.replace(/^offline_/, "");
    if (!shop) {
        return res
            .status(StatusCode.BAD_REQUEST)
            .json(new ApiResponse(false, "Missing shop domain in URL."));
    }
    try {
        if (req.method === "GET") {
            // Find session by shop domain
            const session = await shopifySession.findOne({ shop });
            if (!session) {
                return res
                    .status(StatusCode.NOT_FOUND)
                    .json(new ApiResponse(false, "Session not found."));
            }
            return res.status(StatusCode.OK).json(session);
        }
        else if (req.method === "POST") {
            // Upsert session by shop domain
            const data = req.body;
            if (!data || !data.id || !data.shop) {
                return res
                    .status(StatusCode.BAD_REQUEST)
                    .json(new ApiResponse(false, "Missing session data (id, shop)."));
            }
            const updated = await shopifySession.findOneAndUpdate({ shop: data.shop }, { $set: data }, { upsert: true, new: true });
            return res.status(StatusCode.OK).json(updated);
        }
        else if (req.method === "DELETE") {
            // Delete session by shop domain
            const deleted = await shopifySession.findOneAndDelete({ shop });
            if (!deleted) {
                return res
                    .status(StatusCode.NOT_FOUND)
                    .json(new ApiResponse(false, "Session not found to delete."));
            }
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "Session deleted.", deleted));
        }
        else {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Unsupported method."));
        }
    }
    catch (error) {
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal server error"));
    }
};
// Handle GET, POST, DELETE for /api/phone/:id (Shopify session storage)
export const handleSessionById = async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    // Only handle if id is NOT a valid ObjectId (to avoid conflict with phone routes)
    if (mongoose.Types.ObjectId.isValid(id)) {
        return res
            .status(StatusCode.BAD_REQUEST)
            .json(new ApiResponse(false, "Not a session id route."));
    }
    try {
        if (req.method === "GET") {
            const session = await shopifySession.findOne({ id });
            if (!session) {
                return res
                    .status(StatusCode.NOT_FOUND)
                    .json(new ApiResponse(false, "Session not found."));
            }
            return res.status(StatusCode.OK).json(session);
        }
        else if (req.method === "POST") {
            const data = req.body;
            if (!data || !data.id || !data.shop) {
                return res
                    .status(StatusCode.BAD_REQUEST)
                    .json(new ApiResponse(false, "Missing session data (id, shop)"));
            }
            const updated = await shopifySession.findOneAndUpdate({ id: data.id }, { $set: data }, { upsert: true, new: true });
            return res.status(StatusCode.OK).json(updated);
        }
        else if (req.method === "DELETE") {
            const deleted = await shopifySession.findOneAndDelete({ id });
            if (!deleted) {
                return res
                    .status(StatusCode.NOT_FOUND)
                    .json(new ApiResponse(false, "Session not found to delete."));
            }
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "Session deleted.", deleted));
        }
        else {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Unsupported method."));
        }
    }
    catch (error) {
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal server error"));
    }
};
// This function runs in the background and only needs the 'shop' domain.
export const uninstallCleanupBackground = async (shop) => {
    try {
        // No apiKey check needed here as it's an internal background process.
        if (!shop) {
            console.warn("[uninstallCleanupBackground] Missing shop domain.");
            return;
        }
        // Perform your database operations:
        const sessionDoc = await mongoose.connection
            .collection("shopify_sessions")
            .findOne({ shop });
        if (!sessionDoc) {
            console.log(`[uninstallCleanupBackground] No session found for shop: ${shop}`);
            return;
        }
        await mongoose.connection
            .collection("shopify_sessions")
            .updateOne({ shop }, { $set: { accessToken: null } });
        console.log(`[uninstallCleanupBackground] Access token nulled for shop: ${shop}`);
    }
    catch (error) {
        console.error("❌ Error in uninstallCleanupBackground:", error);
    }
};
// Uninstall cleanup: set accessToken to null for a shop instead of deleting records
export const uninstallCleanup = async (req, res) => {
    try {
        const apiKey = req.headers["x-api-key"];
        if (apiKey !== process.env.BACKEND_API_KEY) {
            console.warn("⚠️ Unauthorized uninstallCleanup attempt from IP:", req.ip);
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { shop } = req.body;
        if (!shop) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Missing shop domain."));
        }
        // Find the session for this shop
        const sessionDoc = await mongoose.connection
            .collection("shopify_sessions")
            .findOne({ shop });
        if (!sessionDoc) {
            console.log(`[uninstallCleanup] No session found for shop: ${shop}`);
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "No session to update."));
        }
        // Update only the accessToken to null to persist other data
        await mongoose.connection
            .collection("shopify_sessions")
            .updateOne({ shop }, { $set: { accessToken: null } });
        console.log(`[uninstallCleanup] Access token nulled for shop: ${shop}`);
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "Session access token preserved as null.", sessionDoc));
    }
    catch (error) {
        console.error("❌ Error in uninstallCleanup:", error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal server error"));
    }
};
// Public API for storefront theme - get USP bar data by shop domain
export const getPublicUspSlider = async (req, res) => {
    try {
        const shopParam = Array.isArray(req.params.shop)
            ? req.params.shop[0]
            : req.params.shop;
        // Handle both with and without .myshopify.com
        let shop = shopParam;
        if (!shop.includes(".myshopify.com")) {
            shop = `${shop}.myshopify.com`;
        }
        console.log("🌐 Public API - Shop param:", shopParam);
        console.log("🌐 Public API - Shop formatted:", shop);
        if (!shop) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json(new ApiResponse(false, "Missing shop domain."));
        }
        // Find the session for this shop
        const sessionDoc = await mongoose.connection
            .collection("shopify_sessions")
            .findOne({ shop });
        console.log("🔍 Session found:", sessionDoc ? "Yes" : "No");
        if (sessionDoc) {
            console.log("🔍 Session _id:", sessionDoc._id);
        }
        if (!sessionDoc || !sessionDoc._id) {
            console.log("❌ Session not found for shop:", shop);
            // Try to find all sessions to debug
            const allSessions = await mongoose.connection
                .collection("shopify_sessions")
                .find({})
                .toArray();
            console.log("📋 All sessions shops:", allSessions.map((s) => s.shop));
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "No USP Bar found.", []));
        }
        // Get all enabled USP bar items for this shop
        const response = await uspSliderService.getAllUsp({
            shopify_session_id: sessionDoc._id,
            enabled: true,
        });
        console.log("📦 USP Bar items found:", response ? response.length : 0);
        if (!response || response.length === 0) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "No USP Bar found.", []));
        }
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "USP Bar retrieved successfully.", response));
    }
    catch (error) {
        console.error("❌ Error in getPublicUspSlider:", error);
        return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(false, "Internal server error"));
    }
};
//# sourceMappingURL=usp-slider.js.map