import { Request, Response } from "express";
import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";
import * as uspSliderService from "../service/usp-slider.js";
import mongoose from "mongoose";
import shopifySession from "../models/shopify-session.js";

// Get current shopify_session_id
export const getCurrentShopifySessionId = asyncHandler(
  async (req: Request, res: Response) => {
    const shopDomain = req.headers["x-shopify-shop-domain"] as string;
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
    return res.json(
      new ApiResponse(
        true,
        "Shopify session retrieved successfully.",
        sessionDoc,
      ),
    );
  },
);

// Create
export const createUspSlider = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, description, shopify_session_id, designSettings, icon } =
      req.body;

    if (!title || !description || !shopify_session_id) {
      throw new AppError(
        "Title, description and shopify_session_id are required.",
        StatusCode.BAD_REQUEST,
      );
    }

    const response = await uspSliderService.createUsp({
      title,
      description,
      shopify_session_id,
      designSettings,
      icon,
    });

    if (!response) {
      throw new AppError(
        "Failed to create new usp bar.",
        StatusCode.BAD_REQUEST,
      );
    }

    return res
      .status(StatusCode.CREATED)
      .json(new ApiResponse(true, "USP Bar created successfully.", response));
  },
);

// List
export const getAllUspSlider = asyncHandler(
  async (_req: Request, res: Response) => {
    // Get shop domain header
    const shopDomain = res.req.headers["x-shopify-shop-domain"] as string;
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

    return res
      .status(StatusCode.OK)
      .json(new ApiResponse(true, "USP Bar retrieved successfully.", response));
  },
);

// Detail
export const getUspSliderById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid USP Bar ID format.", StatusCode.BAD_REQUEST);
    }

    const response = await uspSliderService.getUspById(id);

    if (!response) {
      throw new AppError("USP Bar not found.", StatusCode.NOT_FOUND);
    }

    return res
      .status(StatusCode.OK)
      .json(new ApiResponse(true, "USP Bar retrieved successfully.", response));
  },
);

// Update
export const updateUspSliderById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, description, designSettings, icon } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid USP Bar ID format.", StatusCode.BAD_REQUEST);
    }

    if (!title || !description) {
      throw new AppError(
        "Title, description are required.",
        StatusCode.BAD_REQUEST,
      );
    }

    const response = await uspSliderService.updateUspById(id, {
      title,
      description,
      designSettings,
      icon,
    });

    if (!response) {
      throw new AppError("USP Bar not found.", StatusCode.NOT_FOUND);
    }

    return res
      .status(StatusCode.OK)
      .json(new ApiResponse(true, "USP Bar updated successfully.", response));
  },
);

// Delete
export const deleteUspSliderById = asyncHandler(
  async (req: Request, res: Response) => {
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
  },
);

// Toggle enabled status
export const toggleUspSliderEnabled = asyncHandler(
  async (req: Request, res: Response) => {
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
      .json(
        new ApiResponse(
          true,
          `USP Bar ${response.enabled ? "enabled" : "disabled"} successfully.`,
          response,
        ),
      );
  },
);

// Handle GET, POST, DELETE for /api/phone/offline_{shop}
export const handleOfflineSession = asyncHandler(
  async (req: Request, res: Response) => {
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
    } else if (req.method === "POST") {
      // Upsert session by shop domain
      const data = req.body;
      if (!data || !data.id || !data.shop) {
        throw new AppError(
          "Missing session data (id, shop).",
          StatusCode.BAD_REQUEST,
        );
      }
      const updated = await shopifySession.findOneAndUpdate(
        { shop: data.shop },
        { $set: data },
        { upsert: true, new: true },
      );
      return res.status(StatusCode.OK).json(updated);
    } else if (req.method === "DELETE") {
      // Delete session by shop domain
      const deleted = await shopifySession.findOneAndDelete({ shop });
      if (!deleted) {
        throw new AppError(
          "Session not found to delete.",
          StatusCode.NOT_FOUND,
        );
      }
      return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "Session deleted.", deleted));
    } else {
      throw new AppError("Unsupported method.", StatusCode.BAD_REQUEST);
    }
  },
);

// Handle GET, POST, DELETE for /api/phone/:id (Shopify session storage)
export const handleSessionById = asyncHandler(
  async (req: Request, res: Response) => {
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
    } else if (req.method === "POST") {
      const data = req.body;
      if (!data || !data.id || !data.shop) {
        throw new AppError(
          "Missing session data (id, shop)",
          StatusCode.BAD_REQUEST,
        );
      }
      const updated = await shopifySession.findOneAndUpdate(
        { id: data.id },
        { $set: data },
        { upsert: true, new: true },
      );
      return res.status(StatusCode.OK).json(updated);
    } else if (req.method === "DELETE") {
      const deleted = await shopifySession.findOneAndDelete({ id });
      if (!deleted) {
        throw new AppError(
          "Session not found to delete.",
          StatusCode.NOT_FOUND,
        );
      }
      return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "Session deleted.", deleted));
    } else {
      throw new AppError("Unsupported method.", StatusCode.BAD_REQUEST);
    }
  },
);

// This function runs in the background and only needs the 'shop' domain.
export const uninstallCleanupBackground = async (shop: string) => {
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
      console.log(
        `[uninstallCleanupBackground] No session found for shop: ${shop}`,
      );
      return;
    }

    await mongoose.connection
      .collection("shopify_sessions")
      .updateOne({ shop }, { $set: { accessToken: null } });

    console.log(
      `[uninstallCleanupBackground] Access token nulled for shop: ${shop}`,
    );
  } catch (error) {
    console.error("❌ Error in uninstallCleanupBackground:", error);
  }
};

// Uninstall cleanup: set accessToken to null for a shop instead of deleting records
export const uninstallCleanup = asyncHandler(
  async (req: Request, res: Response) => {
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

    console.log(`[uninstallCleanup] Access token nulled for shop: ${shop}`);

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          true,
          "Session access token preserved as null.",
          sessionDoc,
        ),
      );
  },
);

// Public API for storefront theme - get USP bar data by shop domain
export const getPublicUspSlider = asyncHandler(
  async (req: Request, res: Response) => {
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
      console.log(
        "📋 All sessions shops:",
        allSessions.map((s) => s.shop),
      );

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
  },
);
