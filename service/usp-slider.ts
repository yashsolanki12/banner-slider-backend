import { UspSliderDocument } from "../types/usp-slider.types.js";
import { UspSlider } from "../models/usp-slider.js";
import mongoose from "mongoose";

// Create new usp slider
export const createUsp = async (
  data: Pick<UspSliderDocument, "title" | "description" | "shopify_session_id">,
): Promise<UspSliderDocument> => {
  return await UspSlider.create({
    title: data.title,
    description: data.description,
    shopify_session_id: data.shopify_session_id,
  });
};

// Get all usp slider
export const getAllUsp = async (
  filter: Partial<UspSliderDocument> = {},
): Promise<UspSliderDocument[]> => {
  const mongoFilter: any = { ...filter };
  if (mongoFilter.shopify_session_id) {
    mongoFilter.shopify_session_id = new mongoose.Types.ObjectId(
      mongoFilter.shopify_session_id as any,
    );
  }
  return await UspSlider.find(mongoFilter).sort({ createdAt: -1 });
};

// Get by id
export const getUspById = async (
  id: string,
): Promise<UspSliderDocument | null> => {
  return await UspSlider.findById(id);
};

// Update
export const updateUspById = async (
  id: string,
  data: Pick<UspSliderDocument, "title" | "description">,
): Promise<UspSliderDocument | null> => {
  return await UspSlider.findByIdAndUpdate(id, data, { new: true });
};

// Delete
export const deleteUspById = async (
  id: string,
): Promise<UspSliderDocument | null> => {
  return await UspSlider.findByIdAndDelete(id);
};
