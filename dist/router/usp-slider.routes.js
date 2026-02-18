import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { uspSliderSchema } from "../validation/usp-slider-validation.js";
import { createUspSlider, deleteUspSliderById, getAllUspSlider, getCurrentShopifySessionId, getUspSliderById, handleOfflineSession, handleSessionById, uninstallCleanup, updateUspSliderById, } from "../controller/usp-slider.js";
const router = Router();
// / get current shopify_session_id for frontend
router.get("/session/current", getCurrentShopifySessionId);
// Shopify session storage endpoints for offline_{shop} (must be above :id route)
router
    .route("/offline_:shop")
    .get(handleOfflineSession)
    .post(handleOfflineSession)
    .delete(handleOfflineSession);
// Shopify session storage endpoint
router
    .route("/session/:id")
    .get(handleSessionById)
    .post(handleSessionById)
    .delete(handleSessionById);
// Create
router.post("/add", validate(uspSliderSchema), createUspSlider);
// Get All
router.get("/", getAllUspSlider);
// Detail
router.get("/:id", getUspSliderById);
// Update
router.put("/:id", validate(uspSliderSchema), updateUspSliderById);
// Delete
router.delete("/:id", deleteUspSliderById);
// POST uninstall-cleanup to null the shop access token
router.post("/uninstall-cleanup", uninstallCleanup);
export default router;
//# sourceMappingURL=usp-slider.routes.js.map