import express from "express";
import { syncStoreMetrics } from "../controller/store-metrics.js";
const storeMetricsRouter = express.Router();
storeMetricsRouter.post("/sync", syncStoreMetrics);
export default storeMetricsRouter;
//# sourceMappingURL=store-metrics.routes.js.map