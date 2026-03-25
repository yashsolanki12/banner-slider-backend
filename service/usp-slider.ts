import {
  UspSliderDocument,
  DesignSettings,
} from "../types/usp-slider.types.js";
import { UspSlider } from "../models/usp-slider.js";
import mongoose from "mongoose";
import { getGlobalColorsPlain } from "./global-color-settings.js";

// Default design settings
const defaultDesignSettings: DesignSettings = {
  backgroundColor: "#f8f9fa",
  itemBackgroundColor: "#ffffff",
  titleColor: "#333333",
  descriptionColor: "#666666",
  iconBackgroundColor: "#4CAF50",
  iconColor: "#0e0e0e",
  slideSpeed: 4,
  itemBorderRightColor: "#000000", // Default vertical border color (black)
};

// Create new usp slider
export const createUsp = async (
  data: Pick<
    UspSliderDocument,
    "title" | "description" | "shopify_session_id" | "icon" | "page_display"
  > & {
    designSettings?: Partial<DesignSettings>;
    enabled?: boolean;
    useCustomColorSettings?: boolean;
  },
): Promise<UspSliderDocument> => {
  // Determine which color settings to use:
  // - If useCustomColorSettings is true: use provided designSettings or default
  // - If useCustomColorSettings is false/undefined AND global colors exist: use global colors
  // - Otherwise: use default colors
  let finalDesignSettings: DesignSettings;

  if (data.useCustomColorSettings === true) {
    // User wants custom colors - use provided settings or defaults
    finalDesignSettings = {
      ...defaultDesignSettings,
      ...data.designSettings,
    };
  } else if (data.shopify_session_id) {
    // User didn't check custom color settings - check for global colors first
    try {
      const globalColors = await getGlobalColorsPlain(
        data.shopify_session_id.toString(),
      );
      // Use global colors as base (they include defaults if no global settings exist)
      finalDesignSettings = {
        ...defaultDesignSettings,
        ...globalColors,
        ...data.designSettings,
      };
    } catch (error) {
      // If error fetching global colors, fall back to defaults
      console.error("Error fetching global colors, using defaults:", error);
      finalDesignSettings = {
        ...defaultDesignSettings,
        ...data.designSettings,
      };
    }
  } else {
    // No shopify_session_id, use defaults
    finalDesignSettings = {
      ...defaultDesignSettings,
      ...data.designSettings,
    };
  }

  return await UspSlider.create({
    title: data.title,
    description: data.description,
    shopify_session_id: data.shopify_session_id,
    enabled: data.enabled ?? true,
    icon: data.icon,
    useCustomColorSettings: data.useCustomColorSettings ?? false,
    designSettings: finalDesignSettings,
    page_display: data.page_display,
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

  // Handle enabled filter - if enabled is true, also include documents where enabled doesn't exist
  if (mongoFilter.enabled === true) {
    mongoFilter.$or = [{ enabled: true }, { enabled: { $exists: false } }];
    delete mongoFilter.enabled;
  }

  //.sort({ createdAt: -1 })
  return await UspSlider.find(mongoFilter);
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
  data: Pick<
    UspSliderDocument,
    "title" | "description" | "icon" | "page_display"
  > & {
    designSettings?: Partial<DesignSettings>;
    enabled?: boolean;
    useCustomColorSettings?: boolean;
  },
): Promise<UspSliderDocument | null> => {
  const updateData: any = {
    title: data.title,
    description: data.description,
    // pageDisplay: data.pageDisplay,
  };

  if (data.icon !== undefined) {
    updateData.icon = data.icon;
  }

  if (data.designSettings) {
    updateData.designSettings = data.designSettings;
  }

  if (data.enabled !== undefined) {
    updateData.enabled = data.enabled;
  }

  if (data.useCustomColorSettings !== undefined) {
    updateData.useCustomColorSettings = data.useCustomColorSettings;
  }

  if (data.page_display) {
    updateData.page_display = data.page_display;
  }

  return await UspSlider.findByIdAndUpdate(id, updateData, { new: true });
};

// Toggle enabled status
export const toggleEnabled = async (
  id: string,
): Promise<UspSliderDocument | null> => {
  const item = await UspSlider.findById(id);
  if (!item) return null;

  return await UspSlider.findByIdAndUpdate(
    id,
    { enabled: !item.enabled },
    { new: true },
  );
};

// Delete
export const deleteUspById = async (
  id: string,
): Promise<UspSliderDocument | null> => {
  return await UspSlider.findByIdAndDelete(id);
};
