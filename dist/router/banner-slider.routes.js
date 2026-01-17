import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { bannerSliderSchema } from "../validation/banner-slider-validation.js";
import { createBannerSlider, deleteBannerSliderById, getAllBannerSlider, getBannerSliderById, getCurrentShopifySessionId, handleOfflineSession, handleSessionById, updateBannerSliderById, } from "../controller/banner-slider.js";
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
router.post("/add", validate(bannerSliderSchema), createBannerSlider);
// Get All
router.get("/", getAllBannerSlider);
// Detail
router.get("/:id", getBannerSliderById);
// Update
router.put("/:id", validate(bannerSliderSchema), updateBannerSliderById);
// Delete
router.delete("/:id", deleteBannerSliderById);
export default router;
//# sourceMappingURL=banner-slider.routes.js.map