import { BannerSliderDocument } from "../types/banner-slider.types";
import { Schema, model } from "mongoose";

const bannerSliderSchema = new Schema<BannerSliderDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const BannerSlider = model<BannerSliderDocument>(
  "BannerSlider",
  bannerSliderSchema
);
