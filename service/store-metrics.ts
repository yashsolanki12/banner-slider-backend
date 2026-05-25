import storeMetrics from "../models/store-metrics.js";

// Get current plan
export const getStorePlan = async (shop: string) => {
  return await storeMetrics.findOne({ shop: shop });
};
