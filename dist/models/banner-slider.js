import { Schema, model } from "mongoose";
const bannerSliderSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    shopify_session_id: {
        type: Schema.Types.ObjectId,
        ref: "ShopifySession",
        required: true,
    },
}, {
    timestamps: true,
});
export const BannerSlider = model("BannerSlider", bannerSliderSchema);
//# sourceMappingURL=banner-slider.js.map