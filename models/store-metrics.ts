import { Schema, model } from "mongoose";
import { StoreMetrics } from "../types/show-metrics.types";

const storeMetricsSchema = new Schema<StoreMetrics>(
  {
    shop: { type: String, required: true, unique: true },
    viewsCount: { type: Number, default: 0 },
    lastResetMonth: { type: String, required: true },
    planName: { type: String, default: "No Plan" },
  },
  { collection: "store_metrics", timestamps: true },
);

export default model<StoreMetrics>("StoreMetrics", storeMetricsSchema);
