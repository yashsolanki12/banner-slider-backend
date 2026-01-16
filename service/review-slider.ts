import { ReviewSliderDocument } from "../types/review.types.js";
import { ReviewSlider } from "../models/review-slider.js";

// Create new review slider
export const createReview = async (
  data: Pick<ReviewSliderDocument, "title" | "description">
): Promise<ReviewSliderDocument> => {
  return await ReviewSlider.create({
    title: data.title,
    description: data.description,
  });
};

// Get all review slider
export const getAllReview = async (): Promise<ReviewSliderDocument[]> => {
  return await ReviewSlider.find().sort({ createdAt: -1 });
};

// Get by id
export const getReviewById = async (
  id: string
): Promise<ReviewSliderDocument | null> => {
  return await ReviewSlider.findById(id);
};

// Update
export const updateReviewById = async (
  id: string,
  data: Pick<ReviewSliderDocument, "title" | "description">
): Promise<ReviewSliderDocument | null> => {
  return await ReviewSlider.findByIdAndUpdate(id, data, { new: true });
};

// Delete
export const deleteReviewById = async (
  id: string
): Promise<ReviewSliderDocument | null> => {
  return await ReviewSlider.findByIdAndDelete(id);
};
