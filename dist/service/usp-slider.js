import { UspSlider } from "../models/usp-slider.js";
import mongoose from "mongoose";
// Default design settings
const defaultDesignSettings = {
    backgroundColor: "#f8f9fa",
    itemBackgroundColor: "#ffffff",
    titleColor: "#333333",
    descriptionColor: "#666666",
    iconBackgroundColor: "#4CAF50",
    iconColor: "#ffffff",
    slideSpeed: 4,
};
// Create new usp slider
export const createUsp = async (data) => {
    return await UspSlider.create({
        title: data.title,
        description: data.description,
        shopify_session_id: data.shopify_session_id,
        enabled: data.enabled ?? true,
        icon: data.icon,
        designSettings: {
            ...defaultDesignSettings,
            ...data.designSettings,
        },
    });
};
// Get all usp slider
export const getAllUsp = async (filter = {}) => {
    const mongoFilter = { ...filter };
    if (mongoFilter.shopify_session_id) {
        mongoFilter.shopify_session_id = new mongoose.Types.ObjectId(mongoFilter.shopify_session_id);
    }
    // Handle enabled filter - if enabled is true, also include documents where enabled doesn't exist
    if (mongoFilter.enabled === true) {
        mongoFilter.$or = [{ enabled: true }, { enabled: { $exists: false } }];
        delete mongoFilter.enabled;
    }
    return await UspSlider.find(mongoFilter).sort({ createdAt: -1 });
};
// Get by id
export const getUspById = async (id) => {
    return await UspSlider.findById(id);
};
// Update
export const updateUspById = async (id, data) => {
    const updateData = {
        title: data.title,
        description: data.description,
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
    return await UspSlider.findByIdAndUpdate(id, updateData, { new: true });
};
// Toggle enabled status
export const toggleEnabled = async (id) => {
    const item = await UspSlider.findById(id);
    if (!item)
        return null;
    return await UspSlider.findByIdAndUpdate(id, { enabled: !item.enabled }, { new: true });
};
// Delete
export const deleteUspById = async (id) => {
    return await UspSlider.findByIdAndDelete(id);
};
//# sourceMappingURL=usp-slider.js.map