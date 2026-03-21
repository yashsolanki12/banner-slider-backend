import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";
import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import StoreMetrics from "../models/store-metrics.js";
// Fetch or Update Store Metrics
export const syncStoreMetrics = asyncHandler(async (req, res) => {
    const { shop, planName } = req.body;
    if (!shop || !planName) {
        throw new AppError("Shop and planName are required.", StatusCode.BAD_REQUEST);
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
    }
    else {
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
    if (metrics.planName.toLowerCase().includes("plan 1")) {
        limit = 3000;
    }
    else if (metrics.planName.toLowerCase().includes("plan 2")) {
        limit = -1; // Unlimited
    }
    else {
        limit = 1000;
    }
    return res.status(StatusCode.OK).json(new ApiResponse(true, "Store metrics retrieved.", {
        shop: metrics.shop,
        viewsCount: metrics.viewsCount,
        lastResetMonth: metrics.lastResetMonth,
        planName: metrics.planName,
        limit,
    }));
});
//# sourceMappingURL=store-metrics.js.map