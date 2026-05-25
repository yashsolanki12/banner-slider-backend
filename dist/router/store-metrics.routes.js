import express from "express";
import { getSyncStoreMetrics, syncStoreMetrics } from "../controller/store-metrics.js";
const storeMetricsRouter = express.Router();
// Create a new plan
storeMetricsRouter.post("/sync", syncStoreMetrics);
// Get current plan
storeMetricsRouter.get("/sync-metrics/:shop", getSyncStoreMetrics);
export default storeMetricsRouter;
//# sourceMappingURL=store-metrics.routes.js.map