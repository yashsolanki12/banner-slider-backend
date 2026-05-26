import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";
import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import StoreMetrics from "../models/store-metrics.js";
import mongoose from "mongoose";
import * as storeMetricsService from "../service/store-metrics.js";

// Fetch or Update Store Metrics
export const syncStoreMetrics = asyncHandler(
  async (req: Request, res: Response) => {
    const { shop, planName } = req.body;

    if (!shop || !planName) {
      throw new AppError(
        "Shop and planName are required.",
        StatusCode.BAD_REQUEST,
      );
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // e.g., 2026-03

    let metrics = await StoreMetrics.findOne({ shop });

    if (!metrics) {
      metrics = new StoreMetrics({
        shop,
        viewsCount: 0,
        lastResetMonth: currentMonth,
        planName,
      });
      await metrics.save();
    } else {
      let changed = false;

      // Reset if it's a new month
      if (metrics.lastResetMonth !== currentMonth) {
        metrics.viewsCount = 0;
        metrics.lastResetMonth = currentMonth;
        changed = true;
      }

      // Update planName if it has changed
      if (metrics.planName !== planName) {
        metrics.planName = planName;
        changed = true;
      }

      if (changed) {
        await metrics.save();
      }
    }

    // Calculate limit based on plan name
    let limit = 1000;
    if (metrics.planName.toLowerCase().includes("starter")) {
      limit = 2500;
    } else if (metrics.planName.toLowerCase().includes("essential")) {
      limit = -1; // Unlimited
    } else {
      limit = 1000;
    }
    if (limit !== -1 && metrics.viewsCount >= limit) {
      throw new AppError(
        `You have reached the ${limit} monthly view limit for ${planName} plan. Please upgrade your plan to continue.`,
        StatusCode.TOO_MANY_REQUESTS,
      );
    }
    return res.status(StatusCode.OK).json(
      new ApiResponse(true, "Store metrics retrieved.", {
        shop: metrics.shop,
        viewsCount: metrics.viewsCount,
        lastResetMonth: metrics.lastResetMonth,
        planName: metrics.planName,
        limit,
      }),
    );
  },
);

// Get current plan
export const getSyncStoreMetrics = asyncHandler(
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Get shop domain header
      const shopDomain = res.req.headers["x-shopify-shop-domain"] as string;

      if (!shopDomain) {
        throw new AppError(
          "Missing shop domain header.",
          StatusCode.BAD_REQUEST,
        );
      }

      // Find the session for this shop
      const sessionDoc = await mongoose.connection
        .collection("shopify_sessions")
        .findOne({ shop: shopDomain });

      console.log(
        "Session found for all USP Bar 🔎",
        sessionDoc ? "Yes" : "No",
      );

      if (!sessionDoc || !sessionDoc._id) {
        throw new AppError("Session not found.", StatusCode.NOT_FOUND);
      }
      const getSyncData = await storeMetricsService.getStorePlan(shopDomain);
      if (!getSyncData) {
        return res
          .status(StatusCode.NOT_FOUND)
          .json(new ApiResponse(false, "No store metrics found."));
      }
      if (getSyncData) {
        return res
          .status(StatusCode.OK)
          .json(
            new ApiResponse(
              true,
              "Sync store metrics fetched successfully",
              getSyncData,
            ),
          );
      }
    } catch (error) {
      next(error);
    }
  },
);
