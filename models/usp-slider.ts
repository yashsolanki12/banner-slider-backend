import { UspSliderDocument } from "../types/usp-slider.types";
import { Schema, model } from "mongoose";

const uspSliderSchema = new Schema<UspSliderDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    shopify_session_id: {
      type: Schema.Types.ObjectId,
      ref: "ShopifySession",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const UspSlider = model<UspSliderDocument>(
  "UspSlider",
  uspSliderSchema,
);
