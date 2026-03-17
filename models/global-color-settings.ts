import mongoose, { Schema } from "mongoose";
import { GlobalColorSettingsDocument } from "../types/global-color-settings.types";

const globalColorSettingsSchema = new Schema<GlobalColorSettingsDocument>(
  {
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
  },
  {
    timestamps: true,
  },
);

export const GlobalColorSettings = mongoose.model<GlobalColorSettingsDocument>(
  "GlobalColorSettings",
  globalColorSettingsSchema,
);
