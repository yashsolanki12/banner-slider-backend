import { BannerSliderDocument } from "../types/banner-slider.types.js";
import { BannerSlider } from "../models/banner-slider.js";

// Create new banner slider
export const createBanner = async (
  data: Pick<BannerSliderDocument, "title" | "description">
): Promise<BannerSliderDocument> => {
  return await BannerSlider.create({
    title: data.title,
    description: data.description,
  });
};

// Get all banner slider
export const getAllBanner = async (): Promise<BannerSliderDocument[]> => {
  return await BannerSlider.find().sort({ createdAt: -1 });
};

// Get by id
export const getBannerById = async (
  id: string
): Promise<BannerSliderDocument | null> => {
  return await BannerSlider.findById(id);
};

// Update
export const updateBannerById = async (
  id: string,
  data: Pick<BannerSliderDocument, "title" | "description">
): Promise<BannerSliderDocument | null> => {
  return await BannerSlider.findByIdAndUpdate(id, data, { new: true });
};

// Delete
export const deleteBannerById = async (
  id: string
): Promise<BannerSliderDocument | null> => {
  return await BannerSlider.findByIdAndDelete(id);
};
