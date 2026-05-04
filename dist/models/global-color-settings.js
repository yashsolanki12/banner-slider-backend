import mongoose, { Schema } from "mongoose";
const globalColorSettingsSchema = new Schema({
    shopify_session_id: {
        type: Schema.Types.ObjectId,
        ref: "ShopifySession",
        required: true,
        unique: true, // One global color setting per shop
    },
    backgroundColor: { type: String, default: "#f8f9fa" },
    titleColor: { type: String, default: "#333333" },
    descriptionColor: { type: String, default: "#666666" },
    iconBackgroundColor: { type: String, default: "#4CAF50" },
    iconColor: { type: String, default: "#070707" },
    itemBorderRightColor: { type: String, default: "#000000" },
    itemBackgroundColor: { type: String, default: "#ffffff" },
    slideSpeed: { type: Number, default: 4 },
    paddingTop: { type: Number, default: 1 },
    paddingRight: { type: Number, default: 1 },
    paddingBottom: { type: Number, default: 1 },
    paddingLeft: { type: Number, default: 1 },
}, {
    timestamps: true,
});
export const GlobalColorSettings = mongoose.model("GlobalColorSettings", globalColorSettingsSchema);
//# sourceMappingURL=global-color-settings.js.map