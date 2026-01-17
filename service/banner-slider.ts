import { BannerSliderDocument } from "../types/banner-slider.types.js";
import { BannerSlider } from "../models/banner-slider.js";
import mongoose from "mongoose";

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
export const getAllBanner = async (filter: Partial<BannerSliderDocument> = {}): Promise<BannerSliderDocument[]> => {
  const mongoFilter: any = {...filter};
  if(mongoFilter.shopify_session_id) {
    mongoFilter.shopify_session_id = new mongoose.Types.ObjectId(mongoFilter.shopify_session_id as any)
  }
  return await BannerSlider.find(mongoFilter).sort({ createdAt: -1 });
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
