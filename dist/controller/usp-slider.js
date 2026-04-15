import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";
import * as uspSliderService from "../service/usp-slider.js";
import * as globalColorSettingsService from "../service/global-color-settings.js";
import mongoose from "mongoose";
import shopifySession from "../models/shopify-session.js";
import { UspSlider } from "../models/usp-slider.js";
// Get current shopify_session_id
export const getCurrentShopifySessionId = asyncHandler(async (req, res) => {
    const shopDomain = req.headers["x-shopify-shop-domain"];
    console.log("🔑 getCurrentShopifySessionId - Shop domain:", shopDomain);
    if (!shopDomain) {
        throw new AppError("Missing shop domain header.", StatusCode.BAD_REQUEST);
    }
    const sessionDoc = await mongoose.connection
        .collection("shopify_sessions")
        .findOne({ shop: shopDomain });
    console.log("🔍 Session document found:", sessionDoc ? "Yes" : "No");
    if (!sessionDoc || !sessionDoc._id) {
        throw new AppError("Session not found.", StatusCode.NOT_FOUND);
    }
    console.log("✅ Session found successfully");
    return res.json(new ApiResponse(true, "Shopify session retrieved successfully.", sessionDoc));
});
// Create
export const createUspSlider = asyncHandler(async (req, res) => {
    const { title, description, shopify_session_id, designSettings, icon, useCustomColorSettings, page_display, } = req.body;
    if (!title || !shopify_session_id) {
        throw new AppError("Title, shopify_session_id are required.", StatusCode.BAD_REQUEST);
    }
    // Free Plan Limit Validation (Max 10)
    const count = await UspSlider.countDocuments({ shopify_session_id });
    if (count >= 10) {
        let isPaid = false;
        try {
            const sessionDoc = await mongoose.connection
                .collection("shopify_sessions")
                .findOne({ _id: new mongoose.Types.ObjectId(shopify_session_id) });
            if (sessionDoc && sessionDoc.shop && sessionDoc.accessToken) {
                const graphqlQuery = `
            query {
              app {
                installation {
                  activeSubscriptions {
                    status
                  }
                }
              }
            }
          `;
                const graphqlResponse = await fetch(`https://${sessionDoc.shop}/admin/api/2026-04/graphql.json`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Shopify-Access-Token": sessionDoc.accessToken,
                    },
                    body: JSON.stringify({ query: graphqlQuery }),
                });
                if (graphqlResponse.ok) {
                    const data = await graphqlResponse.json();
                    const subscriptions = data?.data?.app?.installation?.activeSubscriptions || [];
                    if (subscriptions.some((sub) => sub.status === "ACTIVE")) {
                        isPaid = true;
                    }
                }
            }
        }
        catch (error) {
            console.error("Error checking subscription limit:", error);
        }
        if (!isPaid) {
            throw new AppError("Limit of 10 USP Bars reached for the Free plan. Please upgrade to a paid plan to create more.", StatusCode.FORBIDDEN);
        }
    }
    const response = await uspSliderService.createUsp({
        title,
        description,
        shopify_session_id,
        designSettings,
        icon,
        useCustomColorSettings,
        page_display,
        enabled: true,
    });
    if (!response) {
        throw new AppError("Failed to create new usp bar.", StatusCode.BAD_REQUEST);
    }
    return res
        .status(StatusCode.CREATED)
        .json(new ApiResponse(true, "USP Bar created successfully.", response));
});
// List
export const getAllUspSlider = asyncHandler(async (_req, res) => {
    // Get shop domain header
    const shopDomain = res.req.headers["x-shopify-shop-domain"];
    console.log("📱 Get all usp slider - Shop Domain", shopDomain);
    if (!shopDomain) {
        throw new AppError("Missing shop domain header.", StatusCode.BAD_REQUEST);
    }
    // Find the session for this shop
    const sessionDoc = await mongoose.connection
        .collection("shopify_sessions")
        .findOne({ shop: shopDomain });
    console.log("Session found for all USP Bar 🔎", sessionDoc ? "Yes" : "No");
    if (!sessionDoc || !sessionDoc._id) {
        throw new AppError("Session not found.", StatusCode.NOT_FOUND);
    }
    const response = await uspSliderService.getAllUsp({
        shopify_session_id: sessionDoc._id,
    });
    if (!response || response.length === 0) {
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(false, "No USP Bar found.", []));
    }
    // Get global color settings to apply to list items
    const globalColors = await globalColorSettingsService.getGlobalColorsPlain(sessionDoc._id.toString());
    // If global colors are set, apply them to each item's designSettings
    // BUT only apply global colors as fallback for fields NOT explicitly set by user
    let finalResponse = response;
    if (globalColors) {
        console.log("🎨 Applying global colors to list items as fallback");
        finalResponse = response.map((item) => {
            // Only apply global colors for fields that are NOT explicitly set in the item
            // This preserves user's custom color overrides
            const mergedDesignSettings = {
                backgroundColor: item.designSettings?.backgroundColor ??
                    globalColors.backgroundColor,
                itemBackgroundColor: item.designSettings?.itemBackgroundColor ??
                    globalColors.itemBackgroundColor,
                titleColor: item.designSettings?.titleColor ?? globalColors.titleColor,
                descriptionColor: item.designSettings?.descriptionColor ??
                    globalColors.descriptionColor,
                iconBackgroundColor: item.designSettings?.iconBackgroundColor ??
                    globalColors.iconBackgroundColor,
                iconColor: item.designSettings?.iconColor ?? globalColors.iconColor,
                slideSpeed: item.designSettings?.slideSpeed ?? globalColors.slideSpeed,
                itemBorderRightColor: item.designSettings?.itemBorderRightColor ??
                    globalColors.itemBorderRightColor,
            };
            const updatedItem = {
                ...item.toObject(),
                useCustomColorSettings: item.useCustomColorSettings ?? false,
                designSettings: mergedDesignSettings,
            };
            return updatedItem;
        });
    }
    else {
        // Even without global colors, ensure useCustomColorSettings is included
        finalResponse = response.map((item) => ({
            ...item.toObject(),
            useCustomColorSettings: item.useCustomColorSettings ?? false,
        }));
    }
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "USP Bar retrieved successfully.", finalResponse));
});
// Detail
export const getUspSliderById = asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid USP Bar ID format.", StatusCode.BAD_REQUEST);
    }
    const response = await uspSliderService.getUspById(id);
    if (!response) {
        throw new AppError("USP Bar not found.", StatusCode.NOT_FOUND);
    }
    // Get shop domain from header to find the session
    const shopDomain = res.req.headers["x-shopify-shop-domain"];
    let finalResponse = response;
    // Apply global color settings if shop domain is available
    if (shopDomain) {
        const sessionDoc = await mongoose.connection
            .collection("shopify_sessions")
            .findOne({ shop: shopDomain });
        if (sessionDoc && sessionDoc._id) {
            // Get global color settings to apply
            const globalColors = await globalColorSettingsService.getGlobalColorsPlain(sessionDoc._id.toString());
            // Apply global colors as fallback for fields NOT explicitly set in the item
            if (globalColors) {
                console.log("🎨 Applying global colors to edit page item as fallback");
                finalResponse = {
                    ...response.toObject(),
                    useCustomColorSettings: response.useCustomColorSettings ?? false,
                    designSettings: {
                        backgroundColor: response.designSettings?.backgroundColor ??
                            globalColors.backgroundColor,
                        itemBackgroundColor: response.designSettings?.itemBackgroundColor ??
                            globalColors.itemBackgroundColor,
                        titleColor: response.designSettings?.titleColor ?? globalColors.titleColor,
                        descriptionColor: response.designSettings?.descriptionColor ??
                            globalColors.descriptionColor,
                        iconBackgroundColor: response.designSettings?.iconBackgroundColor ??
                            globalColors.iconBackgroundColor,
                        iconColor: response.designSettings?.iconColor ?? globalColors.iconColor,
                        slideSpeed: response.designSettings?.slideSpeed ?? globalColors.slideSpeed,
                        itemBorderRightColor: response.designSettings?.itemBorderRightColor ??
                            globalColors.itemBorderRightColor,
                    },
                };
            }
            else {
                // Even without global colors, ensure useCustomColorSettings is included
                finalResponse = {
                    ...response.toObject(),
                    useCustomColorSettings: response.useCustomColorSettings ?? false,
                };
            }
        }
    }
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "USP Bar retrieved successfully.", finalResponse));
});
// Update
export const updateUspSliderById = asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, description, designSettings, icon, useCustomColorSettings, page_display, enabled, } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid USP Bar ID format.", StatusCode.BAD_REQUEST);
    }
    if (!title) {
        throw new AppError("Title is required.", StatusCode.BAD_REQUEST);
    }
    const response = await uspSliderService.updateUspById(id, {
        title,
        description,
        designSettings,
        icon,
        useCustomColorSettings,
        page_display,
        enabled,
    });
    if (!response) {
        throw new AppError("USP Bar not found.", StatusCode.NOT_FOUND);
    }
    // Return the updated response directly - user's updated values should persist
    // (not overwritten by global color settings)
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "USP Bar updated successfully.", response));
});
// Delete
export const deleteUspSliderById = asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid USP Bar ID format.", StatusCode.BAD_REQUEST);
    }
    const response = await uspSliderService.deleteUspById(id);
    if (!response) {
        throw new AppError("USP Bar not found.", StatusCode.NOT_FOUND);
    }
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "USP Bar deleted successfully.", response));
});
// Toggle enabled status
export const toggleUspSliderEnabled = asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid USP Bar ID format.", StatusCode.BAD_REQUEST);
    }
    const response = await uspSliderService.toggleEnabled(id);
    if (!response) {
        throw new AppError("USP Bar not found.", StatusCode.NOT_FOUND);
    }
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, `USP Bar ${response.enabled ? "enabled" : "disabled"} successfully.`, response));
});
// Bulk delete USP bars
export const bulkDeleteUspSlider = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError("No IDs provided for deletion.", StatusCode.BAD_REQUEST);
    }
    // Validate all IDs
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
        throw new AppError(`Invalid IDs: ${invalidIds.join(", ")}`, StatusCode.BAD_REQUEST);
    }
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    const result = await UspSlider.deleteMany({
        _id: { $in: objectIds },
    });
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, `${result.deletedCount} USP Bar(s) deleted successfully.`, { deletedCount: result.deletedCount }));
});
// Bulk toggle USP bars (enable or disable)
export const bulkToggleUspSlider = asyncHandler(async (req, res) => {
    const { ids, enabled } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError("No IDs provided for toggle.", StatusCode.BAD_REQUEST);
    }
    if (typeof enabled !== "boolean") {
        throw new AppError("Enabled status must be a boolean.", StatusCode.BAD_REQUEST);
    }
    // Validate all IDs
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
        throw new AppError(`Invalid IDs: ${invalidIds.join(", ")}`, StatusCode.BAD_REQUEST);
    }
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    const result = await UspSlider.updateMany({ _id: { $in: objectIds } }, { $set: { enabled } });
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, `${result.modifiedCount} USP Bar(s) ${enabled ? "enabled" : "disabled"} successfully.`, { modifiedCount: result.modifiedCount }));
});
// Duplicate data api
export const duplicateUspBar = asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid USP Bar ID format.", StatusCode.BAD_REQUEST);
    }
    const originalItem = await uspSliderService.getUspById(id);
    if (!originalItem) {
        throw new AppError("Usp bar not found.", StatusCode.BAD_REQUEST);
    }
    // Convert this mongoose document to plain js object
    const newItemData = originalItem.toObject();
    // Get the shopify_session_id from the original item
    if (!originalItem.shopify_session_id) {
        throw new AppError("Shopify session ID not found.", StatusCode.BAD_REQUEST);
    }
    const shopify_session_id = originalItem.shopify_session_id.toString();
    // Limit check - block duplicates if already at 10 or more bars (for ALL users)
    const count = await UspSlider.countDocuments({
        shopify_session_id: new mongoose.Types.ObjectId(shopify_session_id),
    });
    console.log(`🔍 Duplicate check: Current count is ${count} for session ${shopify_session_id}`);
    if (count >= 10) {
        console.log(`🚫 BLOCKING duplicate creation - limit of 10 bars reached (current: ${count})`);
        throw new AppError("Limit of 10 USP Bars reached. You cannot create more than 10 USP Bars.", StatusCode.FORBIDDEN);
    }
    // Remove the _id field to allow MongoDB to generate a new one
    delete newItemData._id;
    delete newItemData.__v;
    // Modify other fields for the duplicate
    newItemData.title = `Copy of ${newItemData.title}`;
    newItemData.enabled = true;
    // Create a new Mongoose model instance with the new data
    const duplicatedItem = await UspSlider.create(newItemData);
    return res
        .status(StatusCode.CREATED)
        .json(new ApiResponse(true, "Usp bar duplicated successfully.", duplicatedItem));
});
// Handle GET, POST, DELETE for /api/phone/offline_{shop}
export const handleOfflineSession = asyncHandler(async (req, res) => {
    const shopParam = Array.isArray(req.params.shop)
        ? req.params.shop[0]
        : req.params.shop;
    const shop = shopParam?.replace(/^offline_/, "");
    if (!shop) {
        throw new AppError("Missing shop domain in URL.", StatusCode.BAD_REQUEST);
    }
    if (req.method === "GET") {
        // Find session by shop domain
        const session = await shopifySession.findOne({ shop });
        if (!session) {
            throw new AppError("Session not found.", StatusCode.NOT_FOUND);
        }
        return res.status(StatusCode.OK).json(session);
    }
    else if (req.method === "POST") {
        // Upsert session by shop domain
        const data = req.body;
        if (!data || !data.id || !data.shop) {
            throw new AppError("Missing session data (id, shop).", StatusCode.BAD_REQUEST);
        }
        const updated = await shopifySession.findOneAndUpdate({ shop: data.shop }, { $set: data }, { upsert: true, returnDocument: "after" });
        return res.status(StatusCode.OK).json(updated);
    }
    else if (req.method === "DELETE") {
        // Delete session by shop domain
        const deleted = await shopifySession.findOneAndDelete({ shop });
        if (!deleted) {
            throw new AppError("Session not found to delete.", StatusCode.NOT_FOUND);
        }
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "Session deleted.", deleted));
    }
    else {
        throw new AppError("Unsupported method.", StatusCode.BAD_REQUEST);
    }
});
// Handle GET, POST, DELETE for /api/phone/:id (Shopify session storage)
export const handleSessionById = asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    // Only handle if id is NOT a valid ObjectId (to avoid conflict with phone routes)
    if (mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Not a session id route.", StatusCode.BAD_REQUEST);
    }
    if (req.method === "GET") {
        const session = await shopifySession.findOne({ id });
        if (!session) {
            throw new AppError("Session not found.", StatusCode.NOT_FOUND);
        }
        return res.status(StatusCode.OK).json(session);
    }
    else if (req.method === "POST") {
        const data = req.body;
        if (!data || !data.id || !data.shop) {
            throw new AppError("Missing session data (id, shop).", StatusCode.BAD_REQUEST);
        }
        const updated = await shopifySession.findOneAndUpdate({ id: data.id }, { $set: data }, { upsert: true, returnDocument: "after" });
        return res.status(StatusCode.OK).json(updated);
    }
    else if (req.method === "DELETE") {
        const deleted = await shopifySession.findOneAndDelete({ id });
        if (!deleted) {
            throw new AppError("Session not found to delete.", StatusCode.NOT_FOUND);
        }
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "Session deleted.", deleted));
    }
    else {
        throw new AppError("Unsupported method.", StatusCode.BAD_REQUEST);
    }
});
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
        await mongoose.connection.collection("store_metrics").deleteOne({ shop });
        console.log(`[uninstallCleanupBackground] Access token nulled for shop: ${shop}`);
    }
    catch (error) {
        console.error("❌ Error in uninstallCleanupBackground:", error);
    }
};
// Uninstall cleanup: set accessToken to null for a shop instead of deleting records
export const uninstallCleanup = asyncHandler(async (req, res) => {
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== process.env.BACKEND_API_KEY) {
        console.warn("⚠️ Unauthorized uninstallCleanup attempt from IP:", req.ip);
        throw new AppError("Unauthorized", StatusCode.UNAUTHORIZED);
    }
    const { shop } = req.body;
    if (!shop) {
        throw new AppError("Missing shop domain.", StatusCode.BAD_REQUEST);
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
    await mongoose.connection.collection("store_metrics").deleteOne({ shop });
    console.log(`[uninstallCleanup] Access token nulled for shop: ${shop}`);
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "Session access token preserved as null.", sessionDoc));
});
// Public API for storefront theme - get USP bar data by shop domain
export const getPublicUspSlider = asyncHandler(async (req, res) => {
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
        throw new AppError("Missing shop domain.", StatusCode.BAD_REQUEST);
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
    // --- VIEW LIMIT INCREMENT AND CHECK ---
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const StoreMetrics = (await import("../models/store-metrics.js")).default;
    let metrics = await StoreMetrics.findOne({ shop });
    // Check if no plan selected (only "No Plan" string)
    const isNoPlanInitial = !metrics || metrics.planName === "No Plan";
    if (isNoPlanInitial) {
        // If no plan, set view_count to 0 and return message
        if (!metrics) {
            metrics = new StoreMetrics({
                shop,
                // viewsCount: 0,
                lastResetMonth: currentMonth,
                planName: "No Plan",
            });
            await metrics.save();
        }
        // else {
        //   metrics.viewsCount = 0;
        //   await metrics.save();
        // }
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "No active plan selected. Please select a plan to view content.", []));
    }
    const increment = Math.floor(Math.random() * 8) + 1; // plan view number
    if (!metrics) {
        metrics = new StoreMetrics({
            shop,
            viewsCount: increment,
            lastResetMonth: currentMonth,
            planName: "",
        });
        await metrics.save();
    }
    else {
        if (metrics.lastResetMonth !== currentMonth) {
            metrics.viewsCount = increment;
            metrics.lastResetMonth = currentMonth;
        }
        else {
            metrics.viewsCount += increment;
        }
        await metrics.save();
    }
    let viewLimit = 1000;
    if (metrics.planName.toLowerCase().includes("plan 1")) {
        viewLimit = 3000;
    }
    else if (metrics.planName.toLowerCase().includes("plan 2")) {
        viewLimit = -1; // unlimited
    }
    if (viewLimit !== -1 && metrics.viewsCount > viewLimit) {
        console.log(`❌ View limit exceeded for shop ${shop}. Limit: ${viewLimit}, Views: ${metrics.viewsCount}`);
        // Get the USP bar data even when limit exceeded so frontend can display it with a warning
        // const response = await uspSliderService.getAllUsp({
        //   shopify_session_id: sessionDoc._id,
        //   enabled: true,
        // });
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, `You have reached the ${viewLimit} monthly view limit for ${metrics.planName} plan. Please upgrade your plan to continue.`, []));
    }
    // ----------------------------------------
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
    let limitedResponse = response;
    // Optional: Limit the output if more than 10 and not on paid plan
    if (response.length > 10 && sessionDoc.accessToken) {
        let isPaid = false;
        try {
            const graphqlQuery = `
          query {
            app {
              installation {
                activeSubscriptions {
                  status
                }
              }
            }
          }
        `;
            const graphqlResponse = await fetch(`https://${sessionDoc.shop}/admin/api/2026-04/graphql.json`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": sessionDoc.accessToken,
                },
                body: JSON.stringify({ query: graphqlQuery }),
            });
            if (graphqlResponse.ok) {
                const data = await graphqlResponse.json();
                const subscriptions = data?.data?.app?.installation?.activeSubscriptions || [];
                if (subscriptions.some((sub) => sub.status === "ACTIVE")) {
                    isPaid = true;
                }
            }
        }
        catch (error) {
            console.error("Error checking subscription limit in public API:", error);
        }
        if (!isPaid) {
            limitedResponse = response.slice(0, 10);
        }
    }
    // Get global color settings to apply to public items
    const globalColors = await globalColorSettingsService.getGlobalColorsPlain(sessionDoc._id.toString());
    // Apply global colors as fallback for fields NOT explicitly set in the item
    let finalResponse = limitedResponse;
    if (globalColors) {
        console.log("🎨 Applying global colors to public items as fallback");
        finalResponse = limitedResponse.map((item) => {
            const mergedDesignSettings = {
                backgroundColor: item.designSettings?.backgroundColor ?? globalColors.backgroundColor,
                itemBackgroundColor: item.designSettings?.itemBackgroundColor ??
                    globalColors.itemBackgroundColor,
                titleColor: item.designSettings?.titleColor ?? globalColors.titleColor,
                descriptionColor: item.designSettings?.descriptionColor ??
                    globalColors.descriptionColor,
                iconBackgroundColor: item.designSettings?.iconBackgroundColor ??
                    globalColors.iconBackgroundColor,
                iconColor: item.designSettings?.iconColor ?? globalColors.iconColor,
                slideSpeed: item.designSettings?.slideSpeed ?? globalColors.slideSpeed,
                itemBorderRightColor: item.designSettings?.itemBorderRightColor ??
                    globalColors.itemBorderRightColor,
            };
            const updatedItem = {
                ...item.toObject(),
                designSettings: mergedDesignSettings,
            };
            return updatedItem;
        });
    }
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "USP Bar retrieved successfully.", finalResponse));
});
// Set global color settings
export const setGlobalColorSettings = asyncHandler(async (req, res) => {
    const shopDomain = res.req.headers["x-shopify-shop-domain"];
    console.log("🎨 Set global color settings - Shop Domain:", shopDomain);
    if (!shopDomain) {
        throw new AppError("Missing shop domain header.", StatusCode.BAD_REQUEST);
    }
    // Find the session for this shop
    const sessionDoc = await mongoose.connection
        .collection("shopify_sessions")
        .findOne({ shop: shopDomain });
    if (!sessionDoc || !sessionDoc._id) {
        throw new AppError("Session not found.", StatusCode.NOT_FOUND);
    }
    const { backgroundColor, titleColor, descriptionColor, iconBackgroundColor, iconColor, itemBorderRightColor, itemBackgroundColor, slideSpeed, } = req.body;
    const colors = {
        backgroundColor,
        titleColor,
        descriptionColor,
        iconBackgroundColor,
        iconColor,
        itemBorderRightColor,
        itemBackgroundColor,
        slideSpeed,
    };
    // Filter out undefined values
    const filteredColors = Object.fromEntries(Object.entries(colors).filter(([_, v]) => v !== undefined));
    if (Object.keys(filteredColors).length === 0) {
        throw new AppError("At least one color field is required.", StatusCode.BAD_REQUEST);
    }
    const response = await globalColorSettingsService.setGlobalColorSettings(sessionDoc._id.toString(), filteredColors);
    // Update all USP slider records that don't have custom color settings
    // (i.e., records where useCustomColorSettings is false or not set)
    // Only update the fields that were provided in the request
    const sessionId = sessionDoc._id;
    const updateFields = {};
    if (backgroundColor !== undefined) {
        updateFields["designSettings.backgroundColor"] = backgroundColor;
    }
    if (titleColor !== undefined) {
        updateFields["designSettings.titleColor"] = titleColor;
    }
    if (descriptionColor !== undefined) {
        updateFields["designSettings.descriptionColor"] = descriptionColor;
    }
    if (iconBackgroundColor !== undefined) {
        updateFields["designSettings.iconBackgroundColor"] = iconBackgroundColor;
    }
    if (iconColor !== undefined) {
        updateFields["designSettings.iconColor"] = iconColor;
    }
    if (itemBorderRightColor !== undefined) {
        updateFields["designSettings.itemBorderRightColor"] = itemBorderRightColor;
    }
    if (itemBackgroundColor !== undefined) {
        updateFields["designSettings.itemBackgroundColor"] = itemBackgroundColor;
    }
    if (slideSpeed !== undefined) {
        updateFields["designSettings.slideSpeed"] = slideSpeed;
    }
    // Only run updateMany if there are fields to update
    if (Object.keys(updateFields).length > 0) {
        await UspSlider.updateMany({
            shopify_session_id: sessionId,
            $or: [
                { useCustomColorSettings: { $exists: false } },
                { useCustomColorSettings: false },
            ],
        }, {
            $set: updateFields,
        });
    }
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "Global color settings saved successfully.", response));
});
// Get global color settings
export const getGlobalColorSettings = asyncHandler(async (_req, res) => {
    const shopDomain = res.req.headers["x-shopify-shop-domain"];
    console.log("🎨 Get global color settings - Shop Domain:", shopDomain);
    if (!shopDomain) {
        throw new AppError("Missing shop domain header.", StatusCode.BAD_REQUEST);
    }
    // Find the session for this shop
    const sessionDoc = await mongoose.connection
        .collection("shopify_sessions")
        .findOne({ shop: shopDomain });
    if (!sessionDoc || !sessionDoc._id) {
        throw new AppError("Session not found.", StatusCode.NOT_FOUND);
    }
    const response = await globalColorSettingsService.getGlobalColorSettings(sessionDoc._id.toString());
    // Return default color settings if none exist for this store
    if (!response) {
        const defaultSettings = globalColorSettingsService.getDefaultColorSettings();
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "Default global color settings retrieved successfully.", defaultSettings));
    }
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "Global color settings retrieved successfully.", response));
});
// Delete global color settings
export const deleteGlobalColorSettings = asyncHandler(async (_req, res) => {
    const shopDomain = res.req.headers["x-shopify-shop-domain"];
    console.log("🎨 Delete global color settings - Shop Domain:", shopDomain);
    if (!shopDomain) {
        throw new AppError("Missing shop domain header.", StatusCode.BAD_REQUEST);
    }
    // Find the session for this shop
    const sessionDoc = await mongoose.connection
        .collection("shopify_sessions")
        .findOne({ shop: shopDomain });
    if (!sessionDoc || !sessionDoc._id) {
        throw new AppError("Session not found.", StatusCode.NOT_FOUND);
    }
    const response = await globalColorSettingsService.deleteGlobalColorSettings(sessionDoc._id.toString());
    if (!response) {
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(false, "No global color settings to delete.", null));
    }
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "Global color settings deleted successfully.", response));
});
//# sourceMappingURL=usp-slider.js.map