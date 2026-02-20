import { Router } from "express";
import { uspSliderSchema } from "../validation/usp-slider-validation.js";
import {
  createUspSlider,
  deleteUspSliderById,
  getAllUspSlider,
  getCurrentShopifySessionId,
  getUspSliderById,
  handleOfflineSession,
  handleSessionById,
  uninstallCleanup,
  updateUspSliderById,
} from "../controller/usp-slider.js";
import { validate } from "../middleware/validate.js";
import { validateShopifyHeader } from "../middleware/auth.js";

const router = Router();

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

// POST uninstall-cleanup to null the shop access token
router.post("/uninstall-cleanup", uninstallCleanup);

// get current shopify_session_id for frontend
router.get("/session/current/shop", getCurrentShopifySessionId);

// Apply shopify header check for all below route
router.use(validateShopifyHeader);

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

export default router;
