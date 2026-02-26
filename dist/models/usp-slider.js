import { Schema, model } from "mongoose";
const uspSliderSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    shopify_session_id: {
        type: Schema.Types.ObjectId,
        ref: "ShopifySession",
        required: true,
    },
    enabled: { type: Boolean, default: true },
    icon: { type: String, default: null }, // Store base64 encoded icon or image URL
    designSettings: {
        backgroundColor: { type: String, default: "#f8f9fa" },
        itemBackgroundColor: { type: String, default: "#ffffff" },
        titleColor: { type: String, default: "#333333" },
        descriptionColor: { type: String, default: "#666666" },
        iconBackgroundColor: { type: String, default: "#4CAF50" },
        iconColor: { type: String, default: "#ffffff" },
        slideSpeed: { type: Number, default: 4 },
    },
}, {
    timestamps: true,
});
export const UspSlider = model("UspSlider", uspSliderSchema);
//# sourceMappingURL=usp-slider.js.map