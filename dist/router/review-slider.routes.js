import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { reviewSliderSchema } from "../validation/review-slider-validation.js";
import { createReviewSlider, getAllReviewSlider, getReviewSliderById, updateReviewSliderById, deleteReviewSliderById, } from "../controller/review-slider.js";
const router = Router();
// Create
router.post("/add", validate(reviewSliderSchema), createReviewSlider);
// Get All
router.get("/", getAllReviewSlider);
// Detail
router.get("/:id", getReviewSliderById);
// Update
router.put("/:id", validate(reviewSliderSchema), updateReviewSliderById);
// Delete
router.delete("/:id", deleteReviewSliderById);
export default router;
//# sourceMappingURL=review-slider.routes.js.map