import { ReviewSliderDocument } from "../types/review.types";
import { Schema, model } from "mongoose";

const reviewSliderSchema = new Schema<ReviewSliderDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const ReviewSlider = model<ReviewSliderDocument>(
  "ReviewSlider",
  reviewSliderSchema
);
