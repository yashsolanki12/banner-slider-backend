import { UspSlider } from "../models/usp-slider.js";
import mongoose from "mongoose";
// Create new usp slider
export const createUsp = async (data) => {
    return await UspSlider.create({
        title: data.title,
        description: data.description,
        shopify_session_id: data.shopify_session_id,
    });
};
// Get all usp slider
export const getAllUsp = async (filter = {}) => {
    const mongoFilter = { ...filter };
    if (mongoFilter.shopify_session_id) {
        mongoFilter.shopify_session_id = new mongoose.Types.ObjectId(mongoFilter.shopify_session_id);
    }
    return await UspSlider.find(mongoFilter).sort({ createdAt: -1 });
};
// Get by id
export const getUspById = async (id) => {
    return await UspSlider.findById(id);
};
// Update
export const updateUspById = async (id, data) => {
    return await UspSlider.findByIdAndUpdate(id, data, { new: true });
};
// Delete
export const deleteUspById = async (id) => {
    return await UspSlider.findByIdAndDelete(id);
};
//# sourceMappingURL=usp-slider.js.map