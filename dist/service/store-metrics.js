import storeMetrics from "../models/store-metrics";
// Get current plan
export const getStorePlan = async (shop) => {
    return await storeMetrics.findOne({ shop: shop });
};
//# sourceMappingURL=store-metrics.js.map