import { Schema, model } from "mongoose";
const reviewSliderSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
}, {
    timestamps: true,
});
export const ReviewSlider = model("ReviewSlider", reviewSliderSchema);
//# sourceMappingURL=review-slider.js.map