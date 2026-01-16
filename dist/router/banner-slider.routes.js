import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { bannerSliderSchema } from "../validation/banner-slider-validation.js";
import { createBannerSlider, deleteBannerSliderById, getAllBannerSlider, getBannerSliderById, updateBannerSliderById, } from "../controller/banner-slider.js";
const router = Router();
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