import { Schema, model } from "mongoose";
const storeMetricsSchema = new Schema({
    shop: { type: String, required: true, unique: true },
    viewsCount: { type: Number, default: 0 },
    lastResetMonth: { type: String, required: true },
    planName: { type: String, default: "No Plan" },
}, { collection: "store_metrics", timestamps: true });
export default model("StoreMetrics", storeMetricsSchema);
//# sourceMappingURL=store-metrics.js.map